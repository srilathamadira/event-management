import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';
import { FaCalendarAlt, FaClock, FaEdit, FaSearch, FaSun, FaMoon } from 'react-icons/fa';

function UserDashboard() {
  const [user, setUser] = useState(null);
  const [registeredEvents, setRegisteredEvents] = useState([]);
  const [filteredEvents, setFilteredEvents] = useState([]);
  const [activeTab, setActiveTab] = useState('events');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [darkMode, setDarkMode] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    college: '',
    profilePicture: '',
    password: '',
  });
  const [formError, setFormError] = useState('');
  const [formSuccess, setFormSuccess] = useState('');

  // Fetch user data and registered events on mount
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      const decoded = jwtDecode(token);
      setUser(decoded);
      setFormData({
        name: decoded.name,
        email: decoded.email,
        phone: '',
        college: '',
        profilePicture: '',
        password: '',
      });

      // Fetch registered events (mock API call for now)
      const fetchRegisteredEvents = async () => {
        try {
          const res = await axios.get('http://localhost:5000/api/users/registered-events', {
            headers: { 'x-auth-token': token },
          });
          setRegisteredEvents(res.data);
          setFilteredEvents(res.data);
        } catch (err) {
          console.error('Error fetching registered events:', err);
        }
      };

      fetchRegisteredEvents();
    }
  }, []);

  // Handle search and filter
  useEffect(() => {
    let filtered = registeredEvents;

    // Search by event name
    if (searchQuery) {
      filtered = filtered.filter((event) =>
        event.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Filter by status
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
  }, [searchQuery, filterStatus, registeredEvents]);

  // Toggle dark mode
  useEffect(() => {
    if (darkMode) {
      document.body.classList.add('dark-mode');
    } else {
      document.body.classList.remove('dark-mode');
    }
  }, [darkMode]);

  // Handle form changes
  const handleFormChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Handle profile picture upload
  const handleProfilePictureChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData({ ...formData, profilePicture: reader.result });
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle form submission for updating user details
  const handleUpdateDetails = async (e) => {
    e.preventDefault();
    setFormError('');
    setFormSuccess('');

    // Basic validation
    const emailRegex = /\S+@\S+\.\S+/;
    const phoneRegex = /^\d{10}$/;
    if (!formData.name.trim()) {
      setFormError('Name is required');
      return;
    }
    if (!emailRegex.test(formData.email)) {
      setFormError('Please enter a valid email');
      return;
    }
    if (formData.phone && !phoneRegex.test(formData.phone)) {
      setFormError('Please enter a valid 10-digit phone number');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const res = await axios.put(
        'http://localhost:5000/api/users/update',
        formData,
        {
          headers: { 'x-auth-token': token },
        }
      );
      setFormSuccess('Details updated successfully!');
      // Update user state with new details
      const updatedUser = jwtDecode(token);
      updatedUser.name = formData.name;
      updatedUser.email = formData.email;
      setUser(updatedUser);
    } catch (err) {
      setFormError(err.response?.data?.msg || 'Failed to update details');
    }
  };

  if (!user) {
    return <div>Loading...</div>;
  }

  return (
    <div className={`user-dashboard ${darkMode ? 'dark' : ''}`}>
      {/* Hero Section */}
      <section className="dashboard-hero">
        <div className="hero-content">
          <div className="user-avatar">
            {formData.profilePicture ? (
              <img src={formData.profilePicture} alt="Profile" />
            ) : (
              <div className="avatar-placeholder">{user.name[0]}</div>
            )}
          </div>
          <h1>Welcome, {user.name}!</h1>
          <p>Manage your events and profile with ease.</p>
        </div>
      </section>

      {/* Dark Mode Toggle */}
      <button className="dark-mode-toggle" onClick={() => setDarkMode(!darkMode)}>
        {darkMode ? <FaSun /> : <FaMoon />}
      </button>

      {/* Tab Navigation */}
      <div className="dashboard-tabs">
        <button
          className={activeTab === 'events' ? 'active' : ''}
          onClick={() => setActiveTab('events')}
        >
          Registered Events
        </button>
        <button
          className={activeTab === 'details' ? 'active' : ''}
          onClick={() => setActiveTab('details')}
        >
          Update Details
        </button>
      </div>

      {/* Registered Events Section */}
      {activeTab === 'events' && (
        <section className="registered-events">
          <h2>Registered Events</h2>
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
            <div className="events-grid">
              {filteredEvents.map((event, index) => {
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
                  <motion.div
                    key={event._id}
                    className="event-card"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    whileHover={{ scale: 1.05 }}
                  >
                    <h3>{event.name}</h3>
                    <p>
                      <FaCalendarAlt />{' '}
                      {new Date(event.startDate).toLocaleDateString()} -{' '}
                      {new Date(event.endDate).toLocaleDateString()}
                    </p>
                    <p>
                      <FaClock />{' '}
                      {new Date(event.startDate).toLocaleTimeString()} -{' '}
                      {new Date(event.endDate).toLocaleTimeString()}
                    </p>
                    <p>
                      <strong>Status:</strong> {status}
                    </p>
                    <p>
                      <strong>Type:</strong> {event.type === 'tech' ? 'Technical' : 'Non-Technical'}
                    </p>
                    {event.applyLink && (
                      <a
                        href={event.applyLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="apply-link"
                      >
                        Apply Now
                      </a>
                    )}
                    <button className="view-details-btn">View Details</button>
                  </motion.div>
                );
              })}
            </div>
          ) : (
            <p>No registered events found.</p>
          )}
        </section>
      )}

      {/* Update User Details Section */}
      {activeTab === 'details' && (
        <section className="update-details">
          <h2>Update Your Details</h2>
          <form onSubmit={handleUpdateDetails} className="details-form">
            <div className="form-group">
              <label htmlFor="profilePicture">Profile Picture</label>
              <div className="profile-picture-upload">
                <div className="profile-picture-preview">
                  {formData.profilePicture ? (
                    <img src={formData.profilePicture} alt="Profile Preview" />
                  ) : (
                    <div className="avatar-placeholder">{user.name[0]}</div>
                  )}
                </div>
                <input
                  type="file"
                  id="profilePicture"
                  accept="image/*"
                  onChange={handleProfilePictureChange}
                />
              </div>
            </div>
            <div className="form-group">
              <label htmlFor="name">Name</label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleFormChange}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="email">Email</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleFormChange}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="phone">Phone Number</label>
              <input
                type="text"
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleFormChange}
                placeholder="Enter your phone number"
              />
            </div>
            <div className="form-group">
              <label htmlFor="college">College Name</label>
              <input
                type="text"
                id="college"
                name="college"
                value={formData.college}
                onChange={handleFormChange}
                placeholder="Enter your college name"
              />
            </div>
            <div className="form-group">
              <label htmlFor="password">New Password (optional)</label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleFormChange}
                placeholder="Enter new password"
              />
            </div>
            <button type="submit" className="save-btn">
              Save Changes
            </button>
          </form>
          {formError && <p className="error-message">{formError}</p>}
          {formSuccess && <p className="success-message">{formSuccess}</p>}
        </section>
      )}
    </div>
  );
}

export default UserDashboard;