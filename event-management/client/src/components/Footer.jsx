import { useState } from 'react';
import { Link } from 'react-router-dom';
import { FaFacebookF, FaTwitter, FaInstagram, FaLinkedinIn, FaYoutube } from 'react-icons/fa';
import axios from 'axios';

function Footer() {
  const [email, setEmail] = useState('');
  const [subscriptionMessage, setSubscriptionMessage] = useState('');

  const handleNewsletterSubmit = async (e) => {
    e.preventDefault();
    if (!email) {
      setSubscriptionMessage('Please enter a valid email address.');
      return;
    }
    try {
      await axios.post('http://localhost:5000/api/newsletter', { email });
      setSubscriptionMessage('Subscribed successfully!');
      setEmail('');
    } catch (err) {
      setSubscriptionMessage('Failed to subscribe. Please try again.');
    }
  };

  return (
    <footer className="footer">
      <div className="footer-container">
        {/* Company Branding */}
        <div className="footer-section footer-branding">
          <Link to="/" className="footer-logo">
            EventSync
          </Link>
          <p className="footer-tagline">Your one-stop platform for unforgettable events.</p>
        </div>

        {/* Navigation Links */}
        <div className="footer-section footer-links">
          <h3>Explore</h3>
          <ul>
            <li><Link to="/">Home</Link></li>
            <li><Link to="/events">Events</Link></li>
            <li><Link to="/about">About Us</Link></li>
            <li><Link to="/services">Services</Link></li>
            <li><Link to="/contact">Contact</Link></li>
            <li><Link to="/faq">FAQ / Help Center</Link></li>
          </ul>
        </div>

        {/* Quick Links / Event Categories */}
        <div className="footer-section footer-categories">
          <h3>Event Categories</h3>
          <ul>
            <li><Link to="/events/concerts">Concerts</Link></li>
            <li><Link to="/events/conferences">Conferences</Link></li>
            <li><Link to="/events/weddings">Weddings</Link></li>
            <li><Link to="/events/corporate">Corporate</Link></li>
            <li><Link to="/events/featured">Featured Events</Link></li>
          </ul>
        </div>

        {/* Contact Information */}
        <div className="footer-section footer-contact">
          <h3>Contact Us</h3>
          <p>Phone: +1 (555) 123-4567</p>
          <p>Email: support@eventsync.com</p>
          <p>Address: 123 Event Street, City, Country</p>
        </div>

        {/* Newsletter Subscription */}
        <div className="footer-section footer-newsletter">
          <h3>Stay Updated</h3>
          <form onSubmit={handleNewsletterSubmit}>
            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <button type="submit">Subscribe</button>
          </form>
          {subscriptionMessage && (
            <p className={subscriptionMessage.includes('successfully') ? 'success' : 'error'}>
              {subscriptionMessage}
            </p>
          )}
        </div>
      </div>

      {/* Social Media Links */}
      <div className="footer-social">
        <h3>Follow Us</h3>
        <div className="social-icons">
          <a href="https://facebook.com" target="_blank" rel="noopener noreferrer">
            <FaFacebookF />
          </a>
          <a href="https://twitter.com" target="_blank" rel="noopener noreferrer">
            <FaTwitter />
          </a>
          <a href="https://instagram.com" target="_blank" rel="noopener noreferrer">
            <FaInstagram />
          </a>
          <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer">
            <FaLinkedinIn />
          </a>
          <a href="https://youtube.com" target="_blank" rel="noopener noreferrer">
            <FaYoutube />
          </a>
        </div>
      </div>

      {/* Legal & Policies */}
      <div className="footer-legal">
        <ul>
          <li><Link to="/terms">Terms & Conditions</Link></li>
          <li><Link to="/privacy">Privacy Policy</Link></li>
          <li><Link to="/refund">Refund / Cancellation Policy</Link></li>
        </ul>
      </div>

      {/* Copyright Notice */}
      <div className="footer-copyright">
        <p>&copy; {new Date().getFullYear()} EventSync. All rights reserved.</p>
      </div>
    </footer>
  );
}

export default Footer;