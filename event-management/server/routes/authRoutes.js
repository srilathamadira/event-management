const express = require('express');
const router = express.Router();
const Analytics = require('../models/Analytics');
const auth = require('../middleware/auth');

router.get('/', async (req, res) => {
  try {
    const analytics = await Analytics.find().populate('eventId', 'name');
    console.log('Fetched analytics:', analytics); // Debug log
    if (!analytics || analytics.length === 0) {
      return res.status(200).json([]);
    }
    res.status(200).json(analytics);
  } catch (err) {
    console.error('Fetch analytics error:', err.message); // Debug log
    res.status(500).json({ msg: 'Server error' });
  }
});

router.post('/', auth, async (req, res) => {
  if (req.user.role !== 'admin') {
    console.log('Access denied for user:', req.user.email); // Debug log
    return res.status(403).json({ msg: 'Access denied, admin only' });
  }

  const { eventId, participantCount } = req.body;

  // Validate request body
  if (!eventId || participantCount === undefined) {
    return res.status(400).json({ msg: 'Event ID and participant count are required' });
  }

  try {
    const analytics = new Analytics({ eventId, participantCount });
    await analytics.save();
    console.log('Analytics created:', analytics); // Debug log
    res.status(201).json(analytics);
  } catch (err) {
    console.error('Add analytics error:', err.message); // Debug log
    res.status(500).json({ msg: 'Server error' });
  }
});

module.exports = router;