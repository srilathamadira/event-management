import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';

function Login() {
  const [isLoginMode, setIsLoginMode] = useState(true);
  const [formData, setFormData] = useState({ email: '', password: '', name: '' });
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Reset messages and form data when switching modes
    setError(null);
    setSuccess(null);
    setFormData({ email: '', password: '', name: '' });
  }, [isLoginMode]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    // Basic validation
    if (!formData.email || !formData.password) {
      setError('Email and password are required');
      return;
    }
    if (!isLoginMode && !formData.name) {
      setError('Name is required for registration');
      return;
    }

    try {
      if (isLoginMode) {
        const res = await axios.post('http://localhost:5000/api/users/login', {
          email: formData.email,
          password: formData.password,
        });
        console.log('Login Response:', res.data);
        localStorage.setItem('token', res.data.token);
        setSuccess('Login successful!');
        const decoded = jwtDecode(res.data.token);
        window.dispatchEvent(new Event('authChange'));
        if (decoded.role === 'admin') {
          navigate('/admin');
        } else {
          navigate('/user-dashboard');
        }
      } else {
        const res = await axios.post('http://localhost:5000/api/users/register', {
          email: formData.email,
          password: formData.password,
          name: formData.name,
        });
        console.log('Register Response:', res.data);
        setSuccess('Registration successful! Please log in.');
        setIsLoginMode(true);
      }
    } catch (err) {
      console.error('Auth error:', err);
      if (err.response) {
        console.log('Error Response:', err.response.data);
        setError(err.response.data.msg || 'Authentication failed. Please try again.');
      } else if (err.request) {
        console.log('No response received:', err.request);
        setError('Unable to connect to the server. Please check if the server is running.');
      } else {
        console.log('Error:', err.message);
        setError('An unexpected error occurred. Please try again.');
      }
    }
  };

  return (
    <div className="auth-page">
      {/* Left Side: Tech Theme */}
      <div className="auth-left">
        <div className="auth-left-content">
          <h1>Welcome to EventSync</h1>
          <p>Discover and manage events with ease.</p>
        </div>
      </div>

      {/* Right Side: Non-Tech Theme with Form */}
      <div className={`auth-right ${isLoginMode ? 'login-mode' : 'signup-mode'}`}>
        <div className="auth-form-container">
          <h2>{isLoginMode ? 'Login' : 'Sign Up'}</h2>
          <form onSubmit={handleSubmit} method="POST">
            {!isLoginMode && (
              <div className="form-group">
                <input
                  type="text"
                  name="name"
                  placeholder="Your Name"
                  value={formData.name}
                  onChange={handleChange}
                  required={!isLoginMode}
                />
              </div>
            )}
            <div className="form-group">
              <input
                type="email"
                name="email"
                placeholder="Email"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>
            <div className="form-group">
              <input
                type="password"
                name="password"
                placeholder="Password"
                value={formData.password}
                onChange={handleChange}
                required
              />
            </div>
            <button type="submit" className="auth-btn">
              {isLoginMode ? 'Login' : 'Sign Up'}
            </button>
          </form>
          <p className="toggle-mode">
            {isLoginMode ? "Don't have an account?" : 'Already have an account?'}{' '}
            <button
              type="button"
              onClick={() => setIsLoginMode(!isLoginMode)}
              className="toggle-btn"
            >
              {isLoginMode ? 'Sign Up' : 'Login'}
            </button>
          </p>
          {error && <p className="error-message">{error}</p>}
          {success && <p className="success-message">{success}</p>}
          {isLoginMode && (
            <div className="admin-credentials">
              <p>
                Admin default credentials: <br />
                Email: admin@example.com <br />
                Password: admin
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Login;