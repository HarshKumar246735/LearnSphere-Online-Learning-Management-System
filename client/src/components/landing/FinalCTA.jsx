import { Link } from 'react-router-dom';

export default function FinalCTA() {
  return (
    <section className="section container">
      <div className="final-cta">
        <h2>Your next skill starts with one lesson</h2>
        <p>Create a free account and enroll in your first course today.</p>
        <div className="hero-actions" style={{ justifyContent: 'center' }}>
          <Link to="/register" className="btn btn-brand btn-lg">Create free account</Link>
          <Link to="/courses" className="btn btn-ghost btn-lg">Explore courses</Link>
        </div>
      </div>
    </section>
  );
}
