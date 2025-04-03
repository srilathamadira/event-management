const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
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

// Get all events
router.get('/', auth, async (req, res) => {
  try {
    console.log('Fetching all events');
    const events = await Event.find().populate('createdBy', 'name email');
    if (!events || events.length === 0) {
      return res.status(404).json({ msg: 'No events found' });
    }
    res.status(200).json(events);
  } catch (err) {
    console.error('Error fetching events:', err.message);
    res.status(500).json({ msg: 'Server error while fetching events' });
  }
});

// Add new event
router.post('/', [auth, adminAuth], async (req, res) => {
  const { name, type, category, startDate, endDate, description, picture, applyLink } = req.body;

  // Validate required fields
  if (!name || !type || !category || !startDate || !endDate) {
    return res.status(400).json({ msg: 'Please provide all required fields: name, type, category, startDate, endDate' });
  }

  try {
    const event = new Event({
      name,
      type,
      category,
      startDate,
      endDate,
      description,
      picture,
      applyLink,
      createdBy: req.user.id,
    });

    await event.save();
    res.status(201).json(event);
  } catch (err) {
    console.error('Error adding event:', err.message);
    res.status(500).json({ msg: 'Server error while adding event' });
  }
});

// Update event
router.put('/:id', [auth, adminAuth], async (req, res) => {
  const { name, type, category, startDate, endDate, description, picture, applyLink } = req.body;

  try {
    const event = await Event.findById(req.params.id);
    if (!event) {
      return res.status(404).json({ msg: 'Event not found' });
    }

    // Update fields
    event.name = name || event.name;
    event.type = type || event.type;
    event.category = category || event.category;
    event.startDate = startDate || event.startDate;
    event.endDate = endDate || event.endDate;
    event.description = description || event.description;
    event.picture = picture || event.picture;
    event.applyLink = applyLink || event.applyLink;

    await event.save();
    res.status(200).json(event);
  } catch (err) {
    console.error('Error updating event:', err.message);
    res.status(500).json({ msg: 'Server error while updating event' });
  }
});

// Delete event
router.delete('/:id', [auth, adminAuth], async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) {
      return res.status(404).json({ msg: 'Event not found' });
    }

    await event.deleteOne();
    res.status(200).json({ msg: 'Event deleted successfully' });
  } catch (err) {
    console.error('Error deleting event:', err.message);
    res.status(500).json({ msg: 'Server error while deleting event' });
  }
});

module.exports = router;