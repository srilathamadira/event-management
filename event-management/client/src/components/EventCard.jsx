import { Link } from 'react-router-dom';

function EventCard({ event }) {
  if (!event) {
    return <div className="event-card">Event data is missing.</div>;
  }

  const isTechEvent = event.type === 'tech';

  return (
    <div className={`event-card ${isTechEvent ? 'tech' : 'non-tech'}`}>
      <img
        src={event.picture || 'https://via.placeholder.com/150?text=No+Image'}
        alt={event.name || 'Unnamed Event'}
        onError={(e) => (e.target.src = 'https://via.placeholder.com/150?text=Image+Error')}
      />
      <h3>{event.name || 'Unnamed Event'}</h3>
      <p>{event.location || 'Unknown Location'}</p>
      <p>{event.duration || 'Unknown Duration'}</p>
      <p>Start: {event.startDate ? new Date(event.startDate).toLocaleDateString() : 'Unknown'}</p>
      <p>End: {event.endDate ? new Date(event.endDate).toLocaleDateString() : 'Unknown'}</p>
      <a href={event.applyLink || '#'} target="_blank" rel="noopener noreferrer">
        View More
      </a>
    </div>
  );
}

export default EventCard;