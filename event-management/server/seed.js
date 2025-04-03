const mongoose = require('mongoose');
const User = require('./models/User');
const Event = require('./models/Event');

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/eventsync');

const seedUsers = async () => {
  try {
    // Clear existing users
    await User.deleteMany({});
    console.log('Cleared existing users');

    // Seed an admin user
    const adminUser = new User({
      name: 'Admin User',
      email: 'admin@example.com',
      password: 'admin',
      role: 'admin',
    });

    await adminUser.save();
    console.log('Admin user seeded successfully');

    // Seed a regular user
    const regularUser = new User({
      name: 'Regular User',
      email: 'user@example.com',
      password: 'user123',
      role: 'user',
    });

    await regularUser.save();
    console.log('Regular user seeded successfully');

    // Find some events to register the user for
    const events = await Event.find().limit(3); // Register for the first 3 events
    regularUser.registeredEvents = events.map((event) => event._id);
    await regularUser.save();
    console.log('Regular user registered for events');

    mongoose.connection.close();
  } catch (err) {
    console.error('Error seeding users:', err);
    mongoose.connection.close();
  }
};

seedUsers();