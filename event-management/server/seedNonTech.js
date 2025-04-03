const mongoose = require('mongoose');
const User = require('./models/User');
const Event = require('./models/Event');

mongoose.connect('your-mongodb-connection-string', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => console.log('MongoDB connected'))
  .catch((err) => console.error('MongoDB connection error:', err));

const insertSampleEvent = async () => {
  try {
    const adminUser = await User.findOne({ email: 'admin@example.com' });
    if (!adminUser) {
      console.log('Admin user not found. Please insert the admin user first.');
      return;
    }

    const existingEvent = await Event.findOne({ name: 'Sample Tech Event' });
    if (existingEvent) {
      console.log('Sample event already exists:', existingEvent);
      return;
    }

    const sampleEvent = new Event({
      name: 'Sample Tech Event',
      type: 'tech',
      category: 'Workshop',
      startDate: new Date('2025-04-01T10:00:00Z'),
      endDate: new Date('2025-04-01T12:00:00Z'),
      description: 'A workshop on modern web development.',
      picture: 'https://example.com/sample-event.jpg',
      applyLink: 'https://example.com/apply',
      createdBy: adminUser._id,
    });

    await sampleEvent.save();
    console.log('Sample event inserted:', sampleEvent);
  } catch (err) {
    console.error('Error inserting sample event:', err.message);
  } finally {
    mongoose.connection.close();
  }
};

insertSampleEvent();