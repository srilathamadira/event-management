import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { FaCode, FaTheaterMasks } from 'react-icons/fa';

function Events() {
  const eventCategories = [
    {
      name: 'Technical Events',
      icon: <FaCode />,
      description: 'Explore hackathons, tech fests, and coding contests!',
      link: '/events/technical',
      color: '#007bff', // Electric blue for technical events
    },
    {
      name: 'Non-Technical Events',
      icon: <FaTheaterMasks />,
      description: 'Join sports tournaments and cultural festivities!',
      link: '/events/non-technical',
      color: '#ff6b6b', // Coral for non-technical events
    },
  ];

  return (
    <div className="events-page">
      <section className="event-categories-section">
        <motion.h1
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          Explore Our Events
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          Choose a category to dive into a world of innovation and celebration!
        </motion.p>
        <div className="categories-grid">
          {eventCategories.map((category, index) => (
            <motion.div
              key={index}
              className="category-card"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Link to={category.link} className="category-link">
                <div className="category-icon" style={{ color: category.color }}>
                  {category.icon}
                </div>
                <h3>{category.name}</h3>
                <p>{category.description}</p>
              </Link>
            </motion.div>
          ))}
        </div>
      </section>
    </div>
  );
}

export default Events;