import { useState, useEffect, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import { FaUser, FaBars, FaTimes, FaSun, FaMoon } from 'react-icons/fa';
import { ThemeContext } from '../context/ThemeContext';

function Navbar() {
  const { theme, toggleTheme } = useContext(ThemeContext);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

  // Function to check login state
  const checkLoginState = () => {
    const token = localStorage.getItem('token');
    if (token) {
      setIsLoggedIn(true);
      try {
        const decoded = jwtDecode(token);
        if (decoded.role === 'admin') {
          setIsAdmin(true);
        } else {
          setIsAdmin(false);
        }
      } catch (err) {
        console.error('Invalid token:', err);
        setIsLoggedIn(false);
        setIsAdmin(false);
        localStorage.removeItem('token');
      }
    } else {
      setIsLoggedIn(false);
      setIsAdmin(false);
    }
  };

  // Initial check and listen for storage changes
  useEffect(() => {
    checkLoginState();

    // Listen for changes to localStorage (e.g., login/logout from another tab)
    const handleStorageChange = () => {
      checkLoginState();
    };

    window.addEventListener('storage', handleStorageChange);

    // Custom event to handle login/logout within the same tab
    window.addEventListener('authChange', handleStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('authChange', handleStorageChange);
    };
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    setIsLoggedIn(false);
    setIsAdmin(false);
    setShowDropdown(false);
    setIsMobileMenuOpen(false);
    navigate('/');
    // Dispatch a custom event to notify other components
    window.dispatchEvent(new Event('authChange'));
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        {/* Logo */}
        <Link to="/" className="navbar-logo">
          EventSync
        </Link>

        {/* Hamburger Menu Icon (Mobile) */}
        <button className="navbar-toggle" onClick={toggleMobileMenu}>
          {isMobileMenuOpen ? <FaTimes /> : <FaBars />}
        </button>

        {/* Navigation Links */}
        <ul className={`navbar-links ${isMobileMenuOpen ? 'active' : ''}`}>
          <li><Link to="/" onClick={() => setIsMobileMenuOpen(false)}>Home</Link></li>
          <li className="dropdown">
            <span>Events</span>
            <div className="dropdown-content">
              <Link to="/events/technical" onClick={() => setIsMobileMenuOpen(false)}>Technical</Link>
              <Link to="/events/non-technical" onClick={() => setIsMobileMenuOpen(false)}>Non-Technical</Link>
            </div>
          </li>
          <li><Link to="/about" onClick={() => setIsMobileMenuOpen(false)}>About</Link></li>
          <li><Link to="/contact" onClick={() => setIsMobileMenuOpen(false)}>Contact Us</Link></li>
        </ul>

        {/* User Actions */}
        <div className={`navbar-actions ${isMobileMenuOpen ? 'active' : ''}`}>
          {isAdmin && (
            <Link to="/admin" className="create-event-btn" onClick={() => setIsMobileMenuOpen(false)}>
              Create Event
            </Link>
          )}
          {isLoggedIn ? (
            <div className={`user-menu ${showDropdown ? 'active' : ''}`}>
              <button onClick={() => setShowDropdown(!showDropdown)} className="user-icon">
                <FaUser />
              </button>
              {showDropdown && (
                <div className="dropdown-content user-dropdown">
                  <Link
                    to={isAdmin ? '/admin' : '/user-dashboard'}
                    onClick={() => {
                      setShowDropdown(false);
                      setIsMobileMenuOpen(false);
                    }}
                  >
                    {isAdmin ? 'Admin Dashboard' : 'User Dashboard'}
                  </Link>
                  <button onClick={handleLogout}>Logout</button>
                </div>
              )}
            </div>
          ) : (
            <Link to="/login" className="login-btn" onClick={() => setIsMobileMenuOpen(false)}>
              Login
            </Link>
          )}
          {/* Theme Toggle */}
          <button onClick={toggleTheme} className="theme-toggle">
            {theme === 'light' ? <FaMoon /> : <FaSun />}
          </button>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;