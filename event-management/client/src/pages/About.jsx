import { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { FaCode, FaPalette, FaUsers, FaCalendarAlt } from 'react-icons/fa';

function AboutUs() {
  const timelineRefs = useRef([]);
  const statsRefs = useRef([]);

  // Scroll-triggered animations for timeline and stats
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            if (entry.target.classList.contains('stat-counter')) {
              const target = parseInt(entry.target.getAttribute('data-target'));
              let count = 0;
              const increment = target / 50;
              const updateCounter = () => {
                count += increment;
                if (count < target) {
                  entry.target.textContent = Math.ceil(count);
                  requestAnimationFrame(updateCounter);
                } else {
                  entry.target.textContent = target;
                }
              };
              updateCounter();
            }
          }
        });
      },
      { threshold: 0.3 }
    );

    timelineRefs.current.forEach((ref) => {
      if (ref) observer.observe(ref);
    });

    statsRefs.current.forEach((ref) => {
      if (ref) observer.observe(ref);
    });

    return () => {
      timelineRefs.current.forEach((ref) => {
        if (ref) observer.unobserve(ref);
      });
      statsRefs.current.forEach((ref) => {
        if (ref) observer.unobserve(ref);
      });
    };
  }, []);

  const teamMembers = [
    { name: 'Alex Doe', role: 'Founder & CEO', funFact: 'Loves coding marathons', img: 'https://via.placeholder.com/150' },
    { name: 'Jane Smith', role: 'Creative Director', funFact: 'Avid painter', img: 'https://via.placeholder.com/150' },
    { name: 'Mike Brown', role: 'Event Manager', funFact: 'Plays the guitar', img: 'https://via.placeholder.com/150' },
    { name: 'Sara Lee', role: 'Tech Lead', funFact: 'Tech gadget collector', img: 'https://via.placeholder.com/150' },
  ];

  const testimonials = [
    { name: 'Emily R.', quote: 'EventSync made our tech conference a huge success!' },
    { name: 'John K.', quote: 'The best platform for organizing creative events!' },
    { name: 'Lisa M.', quote: 'Their team is professional and highly dedicated!' },
  ];

  return (
    <div className="about-page">
      {/* Hero Section */}
      <section className="about-hero">
        <div className="hero-content">
          <h1>Who We Are & What We Do</h1>
          <p>Bringing people together through unforgettable tech and creative events.</p>
        </div>
        <div className="floating-icons">
          <div className="icon tech-icon"><FaCode /></div>
          <div className="icon creative-icon"><FaPalette /></div>
          <div className="icon event-icon"><FaCalendarAlt /></div>
        </div>
      </section>

      {/* Our Story */}
      <section className="our-story">
        <h2>Our Story</h2>
        <div className="timeline">
          <div className="timeline-item" ref={(el) => (timelineRefs.current[0] = el)}>
            <div className="timeline-content">
              <h3>2018 - The Beginning</h3>
              <p>EventSync was founded with a vision to bridge tech and creativity through events.</p>
            </div>
          </div>
          <div className="timeline-item" ref={(el) => (timelineRefs.current[1] = el)}>
            <div className="timeline-content">
              <h3>2020 - First Major Event</h3>
              <p>Hosted our first tech conference, attracting over 1,000 attendees.</p>
            </div>
          </div>
          <div className="timeline-item" ref={(el) => (timelineRefs.current[2] = el)}>
            <div className="timeline-content">
              <h3>2022 - Expansion</h3>
              <p>Expanded to non-technical events, hosting art fairs and music festivals.</p>
            </div>
          </div>
          <div className="timeline-item" ref={(el) => (timelineRefs.current[3] = el)}>
            <div className="timeline-content">
              <h3>2024 - Global Reach</h3>
              <p>Partnered with international brands to host events worldwide.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="mission-vision">
        <div className="mission">
          <h2>Our Mission</h2>
          <p className="reveal-text">
            To create seamless, impactful events that inspire innovation and creativity.
          </p>
        </div>
        <div className="vision">
          <h2>Our Vision</h2>
          <p className="reveal-text">
            To be the global leader in event management, connecting communities through technology and art.
          </p>
        </div>
      </section>

      {/* Meet the Team */}
      <section className="meet-team">
        <h2>Meet the Team</h2>
        <div className="team-grid">
          {teamMembers.map((member, index) => (
            <div key={index} className="team-member">
              <img src={member.img} alt={member.name} />
              <div className="member-info">
                <h3>{member.name}</h3>
                <p className="role">{member.role}</p>
                <p className="fun-fact">{member.funFact}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Our Impact */}
      <section className="our-impact">
        <h2>Our Impact</h2>
        <div className="stats-grid">
          <div className="stat">
            <h3 ref={(el) => (statsRefs.current[0] = el)} className="stat-counter" data-target="500">0</h3>
            <p>Events Organized</p>
          </div>
          <div className="stat">
            <h3 ref={(el) => (statsRefs.current[1] = el)} className="stat-counter" data-target="100000">0</h3>
            <p>Attendees Reached</p>
          </div>
          <div className="stat">
            <h3 ref={(el) => (statsRefs.current[2] = el)} className="stat-counter" data-target="200">0</h3>
            <p>Partnerships</p>
          </div>
        </div>
        <div className="testimonials">
          <h3>What Our Clients Say</h3>
          <div className="testimonial-slider">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="testimonial">
                <p>"{testimonial.quote}"</p>
                <h4>- {testimonial.name}</h4>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Call-to-Action */}
      <section className="cta-section">
        <h2>Join Us in Creating Memorable Events!</h2>
        <Link to="/contact" className="cta-btn">Get Started</Link>
      </section>
    </div>
  );
}

export default AboutUs;