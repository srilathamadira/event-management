const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Event = require('../models/Event');
const auth = require('../middleware/auth'); // Import the auth middleware

// Middleware to check if user is admin
const adminAuth = (req, res, next) => {
  if (!req.user || req.user.role !== 'admin') {
    console.error('Admin access denied for user:', req.user ? req.user.email : 'No user');
    return res.status(403).json({ msg: 'Access denied, admin only' });
  }
  next();
};

// Register route
router.post('/register', async (req, res) => {
  const { name, email, password } = req.body;

  // Validate required fields
  if (!name || !email || !password) {
    return res.status(400).json({ msg: 'Please provide name, email, and password' });
  }

  try {
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ msg: 'User already exists' });
    }

    user = new User({
      name,
      email,
      password,
      role: 'user',
    });

    await user.save();

    const payload = {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
    };

    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' });

    res.status(201).json({
      msg: 'Registration successful',
      token,
    });
  } catch (err) {
    console.error('Registration error:', err.message);
    res.status(500).json({ msg: 'Server error while registering user' });
  }
});

// Login route
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  // Validate required fields
  if (!email || !password) {
    return res.status(400).json({ msg: 'Please provide email and password' });
  }

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ msg: 'Invalid email or password' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(400).json({ msg: 'Invalid email or password' });
    }

    const payload = {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
    };

    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' });

    res.status(200).json({
      msg: 'Login successful',
      token,
    });
  } catch (err) {
    console.error('Login error:', err.message);
    res.status(500).json({ msg: 'Server error while logging in' });
  }
});

// Fetch all users (for admin dashboard)
router.get('/', [auth, adminAuth], async (req, res) => {
  try {
    console.log('Fetching all users for admin dashboard');
    const users = await User.find();
    if (!users || users.length === 0) {
      return res.status(404).json({ msg: 'No users found' });
    }
    res.status(200).json(users);
  } catch (err) {
    console.error('Error fetching users:', err.message);
    res.status(500).json({ msg: 'Server error while fetching users' });
  }
});

// Fetch registered events
router.get('/registered-events', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).populate('registeredEvents');
    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }

    res.status(200).json(user.registeredEvents);
  } catch (err) {
    console.error('Error fetching registered events:', err.message);
    res.status(500).json({ msg: 'Server error while fetching registered events' });
  }
});

// Update user details
router.put('/update', auth, async (req, res) => {
  const { name, email, phone, college, profilePicture, password } = req.body;

  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }

    // Update fields
    user.name = name || user.name;
    user.email = email || user.email;
    user.phone = phone || user.phone;
    user.college = college || user.college;
    user.profilePicture = profilePicture || user.profilePicture;
    if (password) {
      user.password = password; // Will be hashed by pre-save middleware
    }

    await user.save();

    // Generate new token with updated user details
    const payload = {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
    };

    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' });

    res.status(200).json({
      msg: 'User details updated successfully',
      token,
    });
  } catch (err) {
    console.error('Error updating user details:', err.message);
    res.status(500).json({ msg: 'Server error while updating user details' });
  }
});

module.exports = router;