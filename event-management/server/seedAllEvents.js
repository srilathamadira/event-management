const mongoose = require('mongoose');
const Event = require('./models/Event');
const User = require('./models/User');

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/eventsync', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const events = [
  {
    name: 'AI Hackathon 2025',
    description: 'A 48-hour hackathon focused on AI and machine learning solutions.',
    location: 'Online',
    duration: '48 hours',
    startDate: new Date('2025-03-27T09:00:00'),
    endDate: new Date('2025-03-29T09:00:00'),
    picture: 'https://via.placeholder.com/150',
    applyLink: 'https://example.com/register/ai-hackathon',
    type: 'tech',
    category: 'hackathon',
  },
  {
    name: 'CyberSec TechFest',
    description: 'A technical fest focusing on cybersecurity workshops and challenges.',
    location: 'Tech Park',
    duration: '2 days',
    startDate: new Date('2025-04-10T10:00:00'),
    endDate: new Date('2025-04-11T18:00:00'),
    picture: 'https://via.placeholder.com/150',
    applyLink: 'https://example.com/register/cybersec-techfest',
    type: 'tech',
    category: 'tech-fest',
  },
  {
    name: 'Spring Sports Tournament',
    description: 'A multi-sport tournament including football, basketball, and volleyball.',
    location: 'City Stadium',
    duration: '3 days',
    startDate: new Date('2025-03-26T09:00:00'),
    endDate: new Date('2025-03-28T18:00:00'),
    picture: 'https://via.placeholder.com/150',
    applyLink: 'https://example.com/register/spring-sports',
    type: 'non-tech',
    category: 'sports',
  },
  {
    name: 'Art & Music Festival',
    description: 'A festival celebrating art exhibitions and live music performances.',
    location: 'Cultural Center',
    duration: '2 days',
    startDate: new Date('2025-05-01T10:00:00'),
    endDate: new Date('2025-05-02T20:00:00'),
    picture: 'https://via.placeholder.com/150',
    applyLink: 'https://example.com/register/art-music-festival',
    type: 'non-tech',
    category: 'cultural',
  },
  {
    name: 'Photography Exhibition',
    description: 'An exhibition showcasing works by local photographers.',
    location: 'Art Gallery',
    duration: '1 day',
    startDate: new Date('2025-06-01T10:00:00'),
    endDate: new Date('2025-06-01T18:00:00'),
    picture: 'https://via.placeholder.com/150',
    applyLink: 'https://example.com/register/photography-exhibition',
    type: 'non-tech',
    category: 'art-fair',
  },
];

const seedAllEvents = async () => {
  try {
    // Clear existing events
    await Event.deleteMany({});
    console.log('Cleared existing events');

    // Find the admin user
    const adminUser = await User.findOne({ role: 'admin' });
    if (!adminUser) {
      console.error('No admin user found. Please create an admin user first.');
      mongoose.connection.close();
      return;
    }

    // Update events with the admin user's ObjectId
    const eventsWithAdmin = events.map((event) => ({
      ...event,
      createdBy: adminUser._id,
    }));

    // Seed the events
    await Event.insertMany(eventsWithAdmin);
    console.log('All events seeded successfully');

    mongoose.connection.close();
  } catch (err) {
    console.error('Error seeding events:', err);
    mongoose.connection.close();
  }
};

seedAllEvents();
