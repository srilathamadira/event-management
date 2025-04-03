const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String },
  location: { type: String },
  duration: { type: String },
  startDate: { type: Date },
  endDate: { type: Date },
  picture: { type: String },
  applyLink: { type: String },
  type: { type: String, enum: ['tech', 'non-tech'], required: true },
  category: {
    type: String,
    enum: [
      'hackathon',
      'tech-fest',
      'contest',
      'sports', // Added for non-technical events
      'cultural', // Added for non-technical events
      'art-fair',
      'music-festival',
      'other',
    ],
    required: true,
  },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Event', eventSchema);