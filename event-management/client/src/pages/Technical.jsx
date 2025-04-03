import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaCode, FaGraduationCap, FaTrophy } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../styles/Technical.css'; // Assuming you have a CSS file for styling
function Technical() {
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  // Fetch events from the backend
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('token');
        console.log('Token for fetching technical events:', token);
        if (!token) {
          console.log('No token found, redirecting to login');
          navigate('/login');
          return;
        }

        const res = await axios.get('http://localhost:5000/api/events', {
          headers: { 'x-auth-token': token },
        });
        console.log('Fetched Technical Events:', res.data);

        const techEvents = res.data.filter((event) => event.type === 'tech');
        setEvents(techEvents);
      } catch (err) {
        console.error('Fetch events error:', err.message);
        if (err.response && err.response.status === 401) {
          console.log('Unauthorized, redirecting to login');
          localStorage.removeItem('token');
          navigate('/login');
        } else {
          setError(err.message || 'Failed to fetch technical events');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, [navigate]);

  const categories = [
    { name: 'Hackathons', icon: <FaCode />, filter: 'hackathon' },
    { name: 'Technical Fests', icon: <FaGraduationCap />, filter: 'tech-fest' },
    { name: 'Weekly Contests', icon: <FaTrophy />, filter: 'contest' },
  ];

  const filteredEvents = selectedCategory
    ? events.filter((event) => event.category === selectedCategory)
    : [];

  const handleCategoryClick = (filter) => {
    setSelectedCategory(filter);
  };

  const handleBackClick = () => {
    setSelectedCategory(null);
  };

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <div className="technical-page">
      <AnimatePresence mode="wait">
        {!selectedCategory ? (
          <motion.div
            key="main"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
          >
            {/* Hero Section */}
            <section className="tech-hero">
              <div className="hero-content">
                <motion.h1
                  initial={{ y: -50, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ duration: 0.8 }}
                >
                  Unleash Innovation: Explore Our Technical Events
                </motion.h1>
                <motion.p
                  initial={{ y: 50, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ duration: 0.8, delay: 0.2 }}
                >
                  Join hackathons, technical fests, and weekly contests to showcase your skills and innovate!
                </motion.p>
              </div>
              <div className="hero-animation"></div>
            </section>

            {/* Event Categories */}
            <section className="event-categories">
              <h2>Event Categories</h2>
              {error && <p className="error-message">{error}</p>}
              <div className="categories-grid">
                {categories.map((category, index) => (
                  <motion.div
                    key={index}
                    className="category-card"
                    onClick={() => handleCategoryClick(category.filter)}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                  >
                    <div className="category-icon">{category.icon}</div>
                    <h3>{category.name}</h3>
                  </motion.div>
                ))}
              </div>
            </section>
          </motion.div>
        ) : (
          <motion.div
            key="events"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="events-list"
          >
            {/* Back Button */}
            <motion.button
              className="back-btn"
              onClick={handleBackClick}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Back to Categories
            </motion.button>

            {/* Event Listings */}
            <h2>{categories.find((cat) => cat.filter === selectedCategory).name} Events</h2>
            {selectedCategory === 'tech-fest' && (
              <motion.div
              className="vcode-card"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <h3>VCode at Vignan University</h3>
              <p>
                <strong className="event-date">April 16, 2025</strong>
              </p>
              <p>Join the biggest coding event at Vignan University and showcase your skills!</p>
              <a
                href="https://d3he19lgc7x23p.cloudfront.net/"
                target="_blank"
                rel="noopener noreferrer"
                className="apply-btn"
              >
                Register Now
              </a>
            </motion.div>
            )}
            {filteredEvents.length > 0 ? (
              <div className="events-grid">
                {filteredEvents.map((event, index) => (
                  <motion.div
                    key={event._id}
                    className="event-card"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                  >
                    <h3>{event.name || 'Unnamed Event'}</h3>
                    <p>
                      <strong>Date & Time:</strong>{' '}
                      {event.startDate
                        ? `${new Date(event.startDate).toLocaleString()} - ${new Date(event.endDate).toLocaleString()}`
                        : 'TBD'}
                    </p>
                    <p>{event.description || 'No description available.'}</p>
                    {event.applyLink && (
                      <a
                        href={event.applyLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="apply-btn"
                      >
                        Apply Now
                      </a>
                    )}
                  </motion.div>
                ))}
              </div>
            ) : (
              <p>No events available in this category.</p>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default Technical;
