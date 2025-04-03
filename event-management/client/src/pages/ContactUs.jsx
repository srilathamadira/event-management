import { useState } from 'react';
import axios from 'axios';
import { FaPhone, FaEnvelope, FaFacebookF, FaTwitter, FaInstagram, FaComment } from 'react-icons/fa';

function ContactUs() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });
  const [errors, setErrors] = useState({});
  const [success, setSuccess] = useState(null);
  const [error, setError] = useState(null);

  const validateForm = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = 'Name is required';
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }
    if (!formData.subject.trim()) newErrors.subject = 'Subject is required';
    if (!formData.message.trim()) newErrors.message = 'Message is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });

    // Real-time validation
    const newErrors = { ...errors };
    if (name === 'name' && value.trim()) delete newErrors.name;
    if (name === 'email') {
      if (value.trim() && /\S+@\S+\.\S+/.test(value)) {
        delete newErrors.email;
      } else {
        newErrors.email = value.trim() ? 'Email is invalid' : 'Email is required';
      }
    }
    if (name === 'subject' && value.trim()) delete newErrors.subject;
    if (name === 'message' && value.trim()) delete newErrors.message;
    setErrors(newErrors);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSuccess(null);
    setError(null);

    if (!validateForm()) return;

    try {
      await axios.post('http://localhost:5000/api/contact', formData);
      setSuccess('Your message has been sent successfully!');
      setFormData({ name: '', email: '', subject: '', message: '' });
      setErrors({});
    } catch (err) {
      setError(err.response?.data?.msg || 'Failed to send message. Please try again.');
    }
  };

  return (
    <div className="contact-page">
      {/* Hero Section */}
      <section className="contact-hero">
        <div className="hero-content">
          <h1>Get in Touch</h1>
          <p>Have questions or need assistance? We're here to help with all your event needs!</p>
        </div>
        <div className="floating-icons">
          <div className="icon tech-icon"></div>
          <div className="icon creative-icon"></div>
          <div className="icon event-icon"></div>
        </div>
      </section>

      {/* Main Content */}
      <div className="contact-main">
        {/* Contact Form */}
        <section className="contact-form-section">
          <h2>Send Us a Message</h2>
          <form onSubmit={handleSubmit} className="contact-form">
            <div className="form-group">
              <input
                type="text"
                name="name"
                placeholder="Your Name"
                value={formData.name}
                onChange={handleChange}
                className={errors.name ? 'error' : ''}
              />
              {errors.name && <span className="error-message">{errors.name}</span>}
            </div>
            <div className="form-group">
              <input
                type="email"
                name="email"
                placeholder="Your Email"
                value={formData.email}
                onChange={handleChange}
                className={errors.email ? 'error' : ''}
              />
              {errors.email && <span className="error-message">{errors.email}</span>}
            </div>
            <div className="form-group">
              <input
                type="text"
                name="subject"
                placeholder="Subject"
                value={formData.subject}
                onChange={handleChange}
                className={errors.subject ? 'error' : ''}
              />
              {errors.subject && <span className="error-message">{errors.subject}</span>}
            </div>
            <div className="form-group">
              <textarea
                name="message"
                placeholder="Your Message"
                value={formData.message}
                onChange={handleChange}
                className={errors.message ? 'error' : ''}
              />
              {errors.message && <span className="error-message">{errors.message}</span>}
            </div>
            <button type="submit" className="submit-btn">Send Message</button>
            {success && <p className="success-message">{success}</p>}
            {error && <p className="error-message">{error}</p>}
          </form>
        </section>

        {/* Contact Details */}
        <section className="contact-details">
          <h2>Contact Information</h2>
          <div className="contact-info">
            <div className="info-item">
              <FaPhone className="info-icon" />
              <p>+1 (555) 123-4567</p>
            </div>
            <div className="info-item">
              <FaEnvelope className="info-icon" />
              <p>support@eventsync.com</p>
            </div>
            <div className="info-item social-links">
              <a href="https://facebook.com" target="_blank" rel="noopener noreferrer">
                <FaFacebookF className="info-icon" />
              </a>
              <a href="https://twitter.com" target="_blank" rel="noopener noreferrer">
                <FaTwitter className="info-icon" />
              </a>
              <a href="https://instagram.com" target="_blank" rel="noopener noreferrer">
                <FaInstagram className="info-icon" />
              </a>
            </div>
          </div>
        </section>
      </div>

    </div>
  );
}

export default ContactUs;