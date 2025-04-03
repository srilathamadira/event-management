import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { FaFacebookF, FaInstagram, FaLinkedinIn, FaTwitter, FaPhone, FaArrowDown } from 'react-icons/fa';
import axios from 'axios';

function Home() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [ongoingEvents, setOngoingEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({ name: '', email: '' });
  const [formError, setFormError] = useState('');
  const [formSuccess, setFormSuccess] = useState('');
  const eventsSectionRef = useRef(null);
  const navigate = useNavigate();

  // Hero slider images
  const slides = [
    { image: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?q=80&w=2070&auto=format&fit=crop', alt: 'Tech Event' },
    { image: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?q=80&w=2074&auto=format&fit=crop', alt: 'Cultural Event' },
    { image: 'https://png.pngtree.com/thumb_back/fh260/back_our/20190621/ourmid/pngtree-blue-sky-white-clouds-silhouette-marathon-sports-poster-background-material-image_181472.jpg', alt: 'Sports Event' },
  ];

  // Autoplay for hero slider
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev === slides.length - 1 ? 0 : prev + 1));
    }, 5000);
    return () => clearInterval(interval);
  }, [slides.length]);

  // Fetch ongoing events
  useEffect(() => {
    const fetchOngoingEvents = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('token');
        console.log('Token for fetching events:', token); // Debug log
        if (!token) {
          console.log('No token found, redirecting to login');
          navigate('/login');
          return;
        }

        const res = await axios.get('http://localhost:5000/api/events', {
          headers: { 'x-auth-token': token },
        });
        console.log('Fetched Events:', res.data); // Debug log

        const now = new Date();
        const ongoing = res.data.filter((event) => {
          const start = new Date(event.startDate);
          const end = new Date(event.endDate);
          return start <= now && now <= end;
        });
        setOngoingEvents(ongoing.slice(0, 3)); // Limit to 3 events
      } catch (err) {
        console.error('Fetch events error:', err.message);
        if (err.response && err.response.status === 401) {
          console.log('Unauthorized, redirecting to login');
          localStorage.removeItem('token'); // Clear invalid token
          navigate('/login');
        } else {
          setFormError(err.message || 'Failed to fetch events');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchOngoingEvents();
  }, [navigate]);

  // Animated counters for analytics
  const [stats, setStats] = useState({ participants: 0, eventsHosted: 0, trendingEvents: 0 });
  const statsRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          const animateCounter = (target, key) => {
            let count = 0;
            const increment = target / 50;
            const updateCounter = () => {
              count += increment;
              if (count < target) {
                setStats((prev) => ({ ...prev, [key]: Math.ceil(count) }));
                requestAnimationFrame(updateCounter);
              } else {
                setStats((prev) => ({ ...prev, [key]: target }));
              }
            };
            updateCounter();
          };

          animateCounter(15000, 'participants');
          animateCounter(500, 'eventsHosted');
          animateCounter(50, 'trendingEvents');
        }
      },
      { threshold: 0.5 }
    );

    if (statsRef.current) observer.observe(statsRef.current);
    return () => {
      if (statsRef.current) observer.unobserve(statsRef.current);
    };
  }, []);

  // Handle newsletter subscription
  const handleSubscribe = async (e) => {
    e.preventDefault();
    setFormError('');
    setFormSuccess('');

    const emailRegex = /\S+@\S+\.\S+/;
    if (!formData.name.trim()) {
      setFormError('Name is required');
      return;
    }
    if (!emailRegex.test(formData.email)) {
      setFormError('Please enter a valid email');
      return;
    }

    try {
      const res = await axios.post('http://localhost:5000/api/newsletter', {
        name: formData.name,
        email: formData.email,
      });
      console.log('Newsletter subscription response:', res.data);
      setFormSuccess('Subscribed successfully!');
      setFormData({ name: '', email: '' });
    } catch (err) {
      console.error('Newsletter subscription error:', err.response || err.message);
      setFormError(err.response?.data?.msg || 'Failed to subscribe. Please try again.');
    }
  };

  const handleScrollToEvents = () => {
    eventsSectionRef.current.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="home-page">
      {/* Hero Section */}
      <section className="hero-section">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentSlide}
            className="hero-slide"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            style={{ backgroundImage: `url(${slides[currentSlide].image})` }}
          >
            <div className="hero-content">
              <motion.h1
                initial={{ y: -50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.8 }}
              >
                Experience the Thrill of Innovation & Celebration!
              </motion.h1>
              <motion.p
                initial={{ y: 50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.8, delay: 0.2 }}
              >
                Join us to explore and participate in exciting technical and non-technical events.
              </motion.p>
              <motion.button
                className="cta-btn"
                onClick={handleScrollToEvents}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Explore Events <FaArrowDown />
              </motion.button>
            </div>
          </motion.div>
        </AnimatePresence>
      </section>

      {/* Ongoing Events Section */}
      <section className="ongoing-events" ref={eventsSectionRef}>
        <h2>Ongoing Events</h2>
        {loading ? (
          <p>Loading events...</p>
        ) : ongoingEvents.length > 0 ? (
          <div className="events-grid">
            {ongoingEvents.map((event, index) => (
              <motion.div
                key={event._id}
                className="event-card"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <h3>{event.name}</h3>
                <p>
                  <strong>Date & Time:</strong>{' '}
                  {new Date(event.startDate).toLocaleString()} -{' '}
                  {new Date(event.endDate).toLocaleString()}
                </p>
                <p>{event.description}</p>
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
          <p>No ongoing events at the moment.</p>
        )}
        <Link to="/events" className="view-more-btn">
          View More
        </Link>
      </section>

      {/* Event Analytics Section */}
      <section className="event-analytics" ref={statsRef}>
        <h2>Our Impact</h2>
        <div className="stats-grid">
          <div className="stat">
            <h3>{stats.participants.toLocaleString()}</h3>
            <p>Total Participants</p>
          </div>
          <div className="stat">
            <h3>{stats.eventsHosted}</h3>
            <p>Events Hosted</p>
          </div>
          <div className="stat">
            <h3>{stats.trendingEvents}</h3>
            <p>Top Trending Events</p>
          </div>
        </div>
      </section>

      {/* Newsletter Subscription Section */}
      <section className="newsletter-section">
        <h2>Stay Updated</h2>
        <p>Subscribe to our newsletter for the latest event updates!</p>
        <form onSubmit={handleSubscribe} className="newsletter-form">
          <div className="form-group">
            <input
              type="text"
              placeholder="Your Name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
          </div>
          <div className="form-group">
            <input
              type="email"
              placeholder="Your Email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            />
          </div>
          <button type="submit" className="subscribe-btn">
            Subscribe Now
          </button>
        </form>
        {formError && <p className="error-message">{formError}</p>}
        {formSuccess && <p className="success-message">{formSuccess}</p>}
      </section>
    </div>
  );
}

export default Home;