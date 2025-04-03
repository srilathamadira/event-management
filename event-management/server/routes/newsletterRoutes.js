const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');

// Newsletter Schema
const newsletterSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  subscribedAt: { type: Date, default: Date.now },
});

const Newsletter = mongoose.model('Newsletter', newsletterSchema);

// Subscribe to newsletter
router.post('/', async (req, res) => {
  const { name, email } = req.body;

  try {
    const existingSubscriber = await Newsletter.findOne({ email });
    if (existingSubscriber) {
      return res.status(400).json({ msg: 'Email already subscribed' });
    }

    const subscriber = new Newsletter({ name, email });
    await subscriber.save();
    res.status(201).json({ msg: 'Subscribed successfully' });
  } catch (err) {
    console.error('Newsletter subscription error:', err);
    res.status(500).json({ msg: 'Server error' });
  }
});

module.exports = router;