const express = require('express');
const router = express.Router();
const Analytics = require('../models/Analytics');
const auth = require('../middleware/auth');

router.get('/', async (req, res) => {
  try {
    const analytics = await Analytics.find().populate('eventId', 'name');
    res.json(analytics);
  } catch (err) {
    console.error('Fetch analytics error:', err);
    res.status(500).json({ msg: 'Server error' });
  }
});

router.post('/', auth, async (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ msg: 'Access denied' });

  const { eventId, participantCount } = req.body;
  try {
    const analytics = new Analytics({ eventId, participantCount });
    await analytics.save();
    res.json(analytics);
  } catch (err) {
    console.error('Add analytics error:', err);
    res.status(500).json({ msg: 'Server error' });
  }
});

module.exports = router;