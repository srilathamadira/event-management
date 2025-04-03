import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';
import Modal from 'react-modal';
import { FaCalendarAlt, FaClock, FaEdit, FaTrash, FaSearch, FaSun, FaMoon, FaPlus, FaUsers, FaCalendarCheck, FaFire } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

// Bind modal to app element for accessibility
Modal.setAppElement('#root');

function AdminDashboard() {
  const [admin, setAdmin] = useState(null);
  const [events, setEvents] = useState([]);
  const [filteredEvents, setFilteredEvents] = useState([]);
  const [stats, setStats] = useState({ totalEvents: 0, upcomingEvents: 0, totalUsers: 0, recentEvents: [] });
  const [activeTab, setActiveTab] = useState('add-event');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [darkMode, setDarkMode] = useState(false);
  const [newEvent, setNewEvent] = useState({
    name: '',
    type: 'tech',
    category: '',
    startDate: '',
    endDate: '',
    description: '',
    picture: '',
    applyLink: '',
  });
  const [eventError, setEventError] = useState('');
  const [eventSuccess, setEventSuccess] = useState('');
  const [adminFormData, setAdminFormData] = useState({
    name: '',
    email: '',
    contact: '',
    profilePicture: '',
    password: '',
  });
  const [adminFormError, setAdminFormError] = useState('');
  const [adminFormSuccess, setAdminFormSuccess] = useState('');
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [editEvent, setEditEvent] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [previewEvent, setPreviewEvent] = useState(null);
  const dragRef = useRef(null);
  const navigate = useNavigate();

  // Fetch admin data, events, and stats on mount
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      console.log('No token found, redirecting to login');
      navigate('/login');
      return;
    }

    try {
      const decoded = jwtDecode(token);
      if (decoded.role !== 'admin') {
        console.log('User is not an admin, redirecting to login');
        localStorage.removeItem('token');
        navigate('/login');
        return;
      }
      setAdmin(decoded);
      setAdminFormData({
        name: decoded.name,
        email: decoded.email,
        contact: '',
        profilePicture: '',
        password: '',
      });
    } catch (err) {
      console.error('Error decoding token:', err);
      localStorage.removeItem('token');
      navigate('/login');
      return;
    }

    // Fetch events and stats
    const fetchData = async () => {
      try {
        // Fetch events
        console.log('Fetching events from /api/events');
        const eventsRes = await axios.get('http://localhost:5000/api/events', {
          headers: { 'x-auth-token': token },
        });
        console.log('Fetched Events:', eventsRes.data);
        const fetchedEvents = eventsRes.data;
        setEvents(fetchedEvents);
        setFilteredEvents(fetchedEvents);

        // Calculate stats
        const now = new Date();
        const totalEvents = fetchedEvents.length;
        const upcomingEvents = fetchedEvents.filter((event) => new Date(event.startDate) > now).length;
        const recentEvents = fetchedEvents
          .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
          .slice(0, 3);

        // Fetch total users
        console.log('Fetching users from /api/users');
        const usersRes = await axios.get('http://localhost:5000/api/users', {
          headers: { 'x-auth-token': token },
        });
        console.log('Fetched Users:', usersRes.data);
        const totalUsers = usersRes.data.length;

        setStats({ totalEvents, upcomingEvents, totalUsers, recentEvents });
      } catch (err) {
        console.error('Error fetching data:', err);
        if (err.response) {
          console.error('Response status:', err.response.status);
          console.error('Response data:', err.response.data);
          if (err.response.status === 401) {
            console.log('Unauthorized, redirecting to login');
            localStorage.removeItem('token');
            navigate('/login');
          } else if (err.response.status === 404) {
            console.error('API endpoint not found. Check if the route exists on the backend.');
            setEventError(`API endpoint not found: ${err.response.config.url}. Please check the backend server.`);
          } else {
            setEventError('Failed to fetch data. Please try again.');
          }
        } else if (err.request) {
          console.error('No response received from the server. Check if the backend is running.');
          setEventError('No response from the server. Please ensure the backend is running on http://localhost:5000.');
        } else {
          console.error('Error setting up the request:', err.message);
          setEventError('An unexpected error occurred. Please try again.');
        }
      }
    };

    fetchData();
  }, [navigate]);

  // Handle search and filter
  useEffect(() => {
    let filtered = events;

    if (searchQuery) {
      filtered = filtered.filter((event) =>
        event.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (filterStatus !== 'all') {
      const now = new Date();
      filtered = filtered.filter((event) => {
        const start = new Date(event.startDate);
        const end = new Date(event.endDate);
        if (filterStatus === 'ongoing') return start <= now && now <= end;
        if (filterStatus === 'upcoming') return start > now;
        if (filterStatus === 'completed') return end < now;
        return true;
      });
    }

    setFilteredEvents(filtered);
  }, [searchQuery, filterStatus, events]);

  // Toggle dark mode
  useEffect(() => {
    if (darkMode) {
      document.body.classList.add('dark-mode');
    } else {
      document.body.classList.remove('dark-mode');
    }
  }, [darkMode]);

  // Handle new event form changes
  const handleNewEventChange = (e) => {
    setNewEvent({ ...newEvent, [e.target.name]: e.target.value });
  };

  // Handle drag-and-drop for event picture
  const handleDragOver = (e) => {
    e.preventDefault();
    dragRef.current.classList.add('drag-over');
  };

  const handleDragLeave = () => {
    dragRef.current.classList.remove('drag-over');
  };

  const handleDrop = (e) => {
    e.preventDefault();
    dragRef.current.classList.remove('drag-over');
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setNewEvent({ ...newEvent, picture: reader.result });
      };
      reader.readAsDataURL(file);
    }
  };

  const handlePictureChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setNewEvent({ ...newEvent, picture: reader.result });
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle adding a new event
  const handleAddEvent = async (e) => {
    e.preventDefault();
    setEventError('');
    setEventSuccess('');

    // Validation
    if (!newEvent.name || !newEvent.category || !newEvent.startDate || !newEvent.endDate) {
      setEventError('Please fill in all required fields');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const res = await axios.post('http://localhost:5000/api/events', newEvent, {
        headers: { 'x-auth-token': token },
      });
      console.log('Event Added:', res.data);
      const updatedEvents = [...events, res.data];
      setEvents(updatedEvents);
      setFilteredEvents(updatedEvents);
      setEventSuccess('Event added successfully!');

      // Reset form
      setNewEvent({
        name: '',
        type: 'tech',
        category: '',
        startDate: '',
        endDate: '',
        description: '',
        picture: '',
        applyLink: '',
      });
      setPreviewEvent(null);

      // Update stats
      const now = new Date();
      const totalEvents = updatedEvents.length;
      const upcomingEvents = updatedEvents.filter((event) => new Date(event.startDate) > now).length;
      const recentEvents = updatedEvents
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .slice(0, 3);
      setStats((prevStats) => ({ ...prevStats, totalEvents, upcomingEvents, recentEvents }));
    } catch (err) {
      console.error('Error adding event:', err);
      if (err.response) {
        console.error('Response status:', err.response.status);
        console.error('Response data:', err.response.data);
        if (err.response.status === 401) {
          setEventError('Unauthorized. Please log in again.');
          localStorage.removeItem('token');
          navigate('/login');
        } else {
          setEventError(err.response.data.msg || 'Failed to add event');
        }
      } else {
        setEventError('Failed to add event. Please try again.');
      }
    }
  };

  // Handle live preview
  const handlePreviewEvent = () => {
    setPreviewEvent(newEvent);
  };

  // Handle edit event
  const openEditModal = (event) => {
    setEditEvent({
      ...event,
      startDate: new Date(event.startDate).toISOString().slice(0, 16),
      endDate: new Date(event.endDate).toISOString().slice(0, 16),
    });
    setModalIsOpen(true);
  };

  const handleEditEventChange = (e) => {
    setEditEvent({ ...editEvent, [e.target.name]: e.target.value });
  };

  const handleEditEvent = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.put(
        `http://localhost:5000/api/events/${editEvent._id}`,
        editEvent,
        {
          headers: { 'x-auth-token': token },
        }
      );
      console.log('Event Updated:', res.data);
      const updatedEvents = events.map((event) =>
        event._id === editEvent._id ? res.data : event
      );
      setEvents(updatedEvents);
      setFilteredEvents(updatedEvents);
      setModalIsOpen(false);
      setEventSuccess('Event updated successfully!');

      // Update stats
      const now = new Date();
      const totalEvents = updatedEvents.length;
      const upcomingEvents = updatedEvents.filter((event) => new Date(event.startDate) > now).length;
      const recentEvents = updatedEvents
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .slice(0, 3);
      setStats((prevStats) => ({ ...prevStats, totalEvents, upcomingEvents, recentEvents }));
    } catch (err) {
      console.error('Error updating event:', err);
      if (err.response) {
        console.error('Response status:', err.response.status);
        console.error('Response data:', err.response.data);
        if (err.response.status === 401) {
          setEventError('Unauthorized. Please log in again.');
          localStorage.removeItem('token');
          navigate('/login');
        } else {
          setEventError(err.response.data.msg || 'Failed to update event');
        }
      } else {
        setEventError('Failed to update event. Please try again.');
      }
    }
  };

  // Handle delete event
  const handleDeleteEvent = async (eventId) => {
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`http://localhost:5000/api/events/${eventId}`, {
        headers: { 'x-auth-token': token },
      });
      console.log('Event Deleted:', eventId);
      const updatedEvents = events.filter((event) => event._id !== eventId);
      setEvents(updatedEvents);
      setFilteredEvents(updatedEvents);
      setDeleteConfirm(null);
      setEventSuccess('Event deleted successfully!');

      // Update stats
      const now = new Date();
      const totalEvents = updatedEvents.length;
      const upcomingEvents = updatedEvents.filter((event) => new Date(event.startDate) > now).length;
      const recentEvents = updatedEvents
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .slice(0, 3);
      setStats((prevStats) => ({ ...prevStats, totalEvents, upcomingEvents, recentEvents }));
    } catch (err) {
      console.error('Error deleting event:', err);
      if (err.response) {
        console.error('Response status:', err.response.status);
        console.error('Response data:', err.response.data);
        if (err.response.status === 401) {
          setEventError('Unauthorized. Please log in again.');
          localStorage.removeItem('token');
          navigate('/login');
        } else {
          setEventError(err.response.data.msg || 'Failed to delete event');
        }
      } else {
        setEventError('Failed to delete event. Please try again.');
      }
    }
  };

  // Handle admin details form changes
  const handleAdminFormChange = (e) => {
    setAdminFormData({ ...adminFormData, [e.target.name]: e.target.value });
  };

  const handleAdminPictureChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setAdminFormData({ ...adminFormData, profilePicture: reader.result });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUpdateAdminDetails = async (e) => {
    e.preventDefault();
    setAdminFormError('');
    setAdminFormSuccess('');

    const emailRegex = /\S+@\S+\.\S+/;
    if (!adminFormData.name.trim()) {
      setAdminFormError('Name is required');
      return;
    }
    if (!emailRegex.test(adminFormData.email)) {
      setAdminFormError('Please enter a valid email');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const res = await axios.put(
        'http://localhost:5000/api/users/update',
        adminFormData,
        {
          headers: { 'x-auth-token': token },
        }
      );
      console.log('Admin Details Updated:', res.data);
      setAdminFormSuccess('Details updated successfully!');
      const updatedAdmin = jwtDecode(res.data.token);
      setAdmin(updatedAdmin);
    } catch (err) {
      console.error('Error updating admin details:', err);
      if (err.response) {
        console.error('Response status:', err.response.status);
        console.error('Response data:', err.response.data);
        if (err.response.status === 401) {
          setAdminFormError('Unauthorized. Please log in again.');
          localStorage.removeItem('token');
          navigate('/login');
        } else {
          setAdminFormError(err.response.data.msg || 'Failed to update details');
        }
      } else {
        setAdminFormError('Failed to update details. Please try again.');
      }
    }
  };

  if (!admin) {
    return <div>Loading...</div>;
  }

  return (
    <div className={`admin-dashboard ${darkMode ? 'dark' : ''}`}>
      {/* Hero Section */}
      <section className="dashboard-hero">
        <div className="hero-content">
          <div className="admin-avatar">
            {adminFormData.profilePicture ? (
              <img src={adminFormData.profilePicture} alt="Profile" />
            ) : (
              <div className="avatar-placeholder">{admin.name[0]}</div>
            )}
          </div>
          <h1>Welcome, Admin!</h1>
          <p>Manage events and settings with ease.</p>
        </div>
        <div className="stats-grid">
          <div className="stat-card">
            <FaCalendarAlt />
            <h3>{stats.totalEvents}</h3>
            <p>Total Events</p>
          </div>
          <div className="stat-card">
            <FaCalendarCheck />
            <h3>{stats.upcomingEvents}</h3>
            <p>Upcoming Events</p>
          </div>
          <div className="stat-card">
            <FaUsers />
            <h3>{stats.totalUsers}</h3>
            <p>Total Users</p>
          </div>
          <div className="stat-card recent-events">
            <FaFire />
            <h3>Recently Added</h3>
            <ul>
              {stats.recentEvents.map((event) => (
                <li key={event._id}>{event.name}</li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* Dark Mode Toggle */}
      <button className="dark-mode-toggle" onClick={() => setDarkMode(!darkMode)}>
        {darkMode ? <FaSun /> : <FaMoon />}
      </button>

      {/* Tab Navigation */}
      <div className="dashboard-tabs">
        <button
          className={activeTab === 'add-event' ? 'active' : ''}
          onClick={() => setActiveTab('add-event')}
        >
          Add Event
        </button>
        <button
          className={activeTab === 'manage-events' ? 'active' : ''}
          onClick={() => setActiveTab('manage-events')}
        >
          Manage Events
        </button>
        <button
          className={activeTab === 'settings' ? 'active' : ''}
          onClick={() => setActiveTab('settings')}
        >
          Settings
        </button>
      </div>

      {/* Add New Event Section */}
      {activeTab === 'add-event' && (
        <section className="add-event">
          <h2>Add New Event</h2>
          <div className="add-event-container">
            <form onSubmit={handleAddEvent} className="event-form">
              <div className="form-group">
                <label htmlFor="name">Event Name</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={newEvent.name}
                  onChange={handleNewEventChange}
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="type">Event Type</label>
                <select
                  id="type"
                  name="type"
                  value={newEvent.type}
                  onChange={handleNewEventChange}
                >
                  <option value="tech">Technical</option>
                  <option value="non-tech">Non-Technical</option>
                </select>
              </div>
              <div className="form-group">
                <label htmlFor="category">Event Category</label>
                <select
                  id="category"
                  name="category"
                  value={newEvent.category}
                  onChange={handleNewEventChange}
                  required
                >
                  <option value="">Select Category</option>
                  {newEvent.type === 'tech' ? (
                    <>
                      <option value="hackathon">Hackathon</option>
                      <option value="tech-fest">Tech Fest</option>
                      <option value="contest">Contest</option>
                    </>
                  ) : (
                    <>
                      <option value="sports">Sports</option>
                      <option value="cultural">Cultural</option>
                      <option value="art-fair">Art Fair</option>
                      <option value="music-festival">Music Festival</option>
                    </>
                  )}
                  <option value="other">Other</option>
                </select>
              </div>
              <div className="form-group">
                <label htmlFor="startDate">Start Date & Time</label>
                <input
                  type="datetime-local"
                  id="startDate"
                  name="startDate"
                  value={newEvent.startDate}
                  onChange={handleNewEventChange}
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="endDate">End Date & Time</label>
                <input
                  type="datetime-local"
                  id="endDate"
                  name="endDate"
                  value={newEvent.endDate}
                  onChange={handleNewEventChange}
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="description">Description</label>
                <textarea
                  id="description"
                  name="description"
                  value={newEvent.description}
                  onChange={handleNewEventChange}
                />
              </div>
              <div className="form-group">
                <label>Event Banner/Image</label>
                <div
                  className="drag-drop-area"
                  ref={dragRef}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                >
                  {newEvent.picture ? (
                    <img src={newEvent.picture} alt="Event Banner Preview" />
                  ) : (
                    <p>Drag & drop an image here or click to upload</p>
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handlePictureChange}
                    style={{ display: 'none' }}
                    id="picture"
                  />
                  <label htmlFor="picture" className="upload-btn">
                    Upload Image
                  </label>
                </div>
              </div>
              <div className="form-group">
                <label htmlFor="applyLink">Apply Link</label>
                <input
                  type="url"
                  id="applyLink"
                  name="applyLink"
                  value={newEvent.applyLink}
                  onChange={handleNewEventChange}
                  placeholder="https://example.com/register"
                />
              </div>
              <div className="form-actions">
                <button type="button" onClick={handlePreviewEvent} className="preview-btn">
                  Preview Event
                </button>
                <button type="submit" className="submit-btn">
                  Add Event
                </button>
              </div>
            </form>
            {previewEvent && (
              <div className="event-preview">
                <h3>Event Preview</h3>
                {previewEvent.picture && (
                  <img src={previewEvent.picture} alt="Event Banner" />
                )}
                <h4>{previewEvent.name}</h4>
                <p>
                  <strong>Type:</strong> {previewEvent.type === 'tech' ? 'Technical' : 'Non-Technical'}
                </p>
                <p>
                  <strong>Category:</strong> {previewEvent.category}
                </p>
                <p>
                  <strong>Date & Time:</strong>{' '}
                  {new Date(previewEvent.startDate).toLocaleString()} -{' '}
                  {new Date(previewEvent.endDate).toLocaleString()}
                </p>
                <p>{previewEvent.description}</p>
                {previewEvent.applyLink && (
                  <a href={previewEvent.applyLink} target="_blank" rel="noopener noreferrer">
                    Apply Now
                  </a>
                )}
              </div>
            )}
          </div>
          {eventError && <p className="error-message">{eventError}</p>}
          {eventSuccess && <p className="success-message">{eventSuccess}</p>}
        </section>
      )}

      {/* Manage Events Section */}
      {activeTab === 'manage-events' && (
        <section className="manage-events">
          <h2>Manage Events</h2>
          <div className="events-controls">
            <div className="search-bar">
              <FaSearch />
              <input
                type="text"
                placeholder="Search events..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              <option value="all">All Events</option>
              <option value="ongoing">Ongoing</option>
              <option value="upcoming">Upcoming</option>
              <option value="completed">Completed</option>
            </select>
          </div>
          {filteredEvents.length > 0 ? (
            <div className="events-table">
              <table>
                <thead>
                  <tr>
                    <th>Event Name</th>
                    <th>Date & Time</th>
                    <th>Category</th>
                    <th>Type</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredEvents.map((event) => {
                    const now = new Date();
                    const start = new Date(event.startDate);
                    const end = new Date(event.endDate);
                    const status =
                      start <= now && now <= end
                        ? 'Ongoing'
                        : start > now
                        ? 'Upcoming'
                        : 'Completed';

                    return (
                      <motion.tr
                        key={event._id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.3 }}
                      >
                        <td>{event.name}</td>
                        <td>
                          {new Date(event.startDate).toLocaleString()} -{' '}
                          {new Date(event.endDate).toLocaleString()}
                        </td>
                        <td>{event.category}</td>
                        <td>{event.type === 'tech' ? 'Technical' : 'Non-Technical'}</td>
                        <td>{status}</td>
                        <td>
                          <button
                            className="edit-btn"
                            onClick={() => openEditModal(event)}
                          >
                            <FaEdit />
                          </button>
                          <button
                            className="delete-btn"
                            onClick={() => setDeleteConfirm(event._id)}
                          >
                            <FaTrash />
                          </button>
                        </td>
                      </motion.tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <p>No events found.</p>
          )}
        </section>
      )}

      {/* Edit Event Modal */}
      <Modal
        isOpen={modalIsOpen}
        onRequestClose={() => setModalIsOpen(false)}
        className="edit-modal"
        overlayClassName="modal-overlay"
      >
        {editEvent && (
          <div className="modal-content">
            <h2>Edit Event</h2>
            <form>
              <div className="form-group">
                <label htmlFor="edit-name">Event Name</label>
                <input
                  type="text"
                  id="edit-name"
                  name="name"
                  value={editEvent.name}
                  onChange={handleEditEventChange}
                />
              </div>
              <div className="form-group">
                <label htmlFor="edit-type">Event Type</label>
                <select
                  id="edit-type"
                  name="type"
                  value={editEvent.type}
                  onChange={handleEditEventChange}
                >
                  <option value="tech">Technical</option>
                   <option value="non-tech">Non-Technical</option>
                </select>
              </div>
              <div className="form-group">
                <label htmlFor="edit-category">Event Category</label>
                <select
                  id="edit-category"
                  name="category"
                  value={editEvent.category}
                  onChange={handleEditEventChange}
                >
                  <option value="">Select Category</option>
                  {editEvent.type === 'tech' ? (
                    <>
                      <option value="hackathon">Hackathon</option>
                      <option value="tech-fest">Tech Fest</option>
                      <option value="contest">Contest</option>
                    </>
                  ) : (
                    <>
                      <option value="sports">Sports</option>
                      <option value="cultural">Cultural</option>
                      <option value="art-fair">Art Fair</option>
                      <option value="music-festival">Music Festival</option>
                    </>
                  )}
                  <option value="other">Other</option>
                </select>
              </div>
              <div className="form-group">
                <label htmlFor="edit-startDate">Start Date & Time</label>
                <input
                  type="datetime-local"
                  id="edit-startDate"
                  name="startDate"
                  value={editEvent.startDate}
                  onChange={handleEditEventChange}
                />
              </div>
              <div className="form-group">
                <label htmlFor="edit-endDate">End Date & Time</label>
                <input
                  type="datetime-local"
                  id="edit-endDate"
                  name="endDate"
                  value={editEvent.endDate}
                  onChange={handleEditEventChange}
                />
              </div>
              <div className="form-group">
                <label htmlFor="edit-description">Description</label>
                <textarea
                  id="edit-description"
                  name="description"
                  value={editEvent.description}
                  onChange={handleEditEventChange}
                />
              </div>
              <div className="form-group">
                <label htmlFor="edit-applyLink">Apply Link</label>
                <input
                  type="url"
                  id="edit-applyLink"
                  name="applyLink"
                  value={editEvent.applyLink}
                  onChange={handleEditEventChange}
                />
              </div>
              <div className="modal-actions">
                <button type="button" onClick={() => setModalIsOpen(false)} className="cancel-btn">
                  Cancel
                </button>
                <button type="button" onClick={handleEditEvent} className="save-btn">
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        )}
      </Modal>

      {/* Delete Confirmation Popup */}
      {deleteConfirm && (
        <div className="delete-confirm">
          <div className="delete-confirm-content">
            <h3>Are you sure?</h3>
            <p>Do you really want to delete this event? This action cannot be undone.</p>
            <div className="delete-confirm-actions">
              <button onClick={() => setDeleteConfirm(null)} className="cancel-btn">
                Cancel
              </button>
              <button onClick={() => handleDeleteEvent(deleteConfirm)} className="delete-btn">
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Admin Details & Settings Section */}
      {activeTab === 'settings' && (
        <section className="admin-settings">
          <h2>Admin Settings</h2>
          <form onSubmit={handleUpdateAdminDetails} className="settings-form">
            <div className="form-group">
              <label htmlFor="admin-profilePicture">Profile Picture</label>
              <div className="profile-picture-upload">
                <div className="profile-picture-preview">
                  {adminFormData.profilePicture ? (
                    <img src={adminFormData.profilePicture} alt="Profile Preview" />
                  ) : (
                    <div className="avatar-placeholder">{admin.name[0]}</div>
                  )}
                </div>
                <input
                  type="file"
                  id="admin-profilePicture"
                  accept="image/*"
                  onChange={handleAdminPictureChange}
                />
              </div>
            </div>
            <div className="form-group">
              <label htmlFor="admin-name">Name</label>
              <input
                type="text"
                id="admin-name"
                name="name"
                value={adminFormData.name}
                onChange={handleAdminFormChange}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="admin-email">Email</label>
              <input
                type="email"
                id="admin-email"
                name="email"
                value={adminFormData.email}
                onChange={handleAdminFormChange}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="admin-contact">Contact Number</label>
              <input
                type="text"
                id="admin-contact"
                name="contact"
                value={adminFormData.contact}
                onChange={handleAdminFormChange}
                placeholder="Enter your contact number"
              />
            </div>
            <div className="form-group">
              <label htmlFor="admin-password">New Password (optional)</label>
              <input
                type="password"
                id="admin-password"
                name="password"
                value={adminFormData.password}
                onChange={handleAdminFormChange}
                placeholder="Enter new password"
              />
            </div>
            <button type="submit" className="save-btn">
              Save Changes
            </button>
          </form>
          {adminFormError && <p className="error-message">{adminFormError}</p>}
          {adminFormSuccess && <p className="success-message">{adminFormSuccess}</p>}
        </section>
      )}
    </div>
  );
}

export default AdminDashboard;