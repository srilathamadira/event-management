const express = require('express');
const router = express.Router();

// Simple contact form submission (you can extend this to store in DB or send emails)
router.post('/', (req, res) => {
  const { name, email, message } = req.body;
  if (!name || !email || !message) {
    return res.status(400).json({ msg: 'Please fill all fields' });
  }
  // In a real app, you might store this in a database or send an email
  console.log('Contact Form Submission:', { name, email, message });
  res.json({ msg: 'Message received' });
});

module.exports = router;