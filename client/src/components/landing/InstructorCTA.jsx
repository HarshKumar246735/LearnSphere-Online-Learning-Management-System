import { Link } from 'react-router-dom';
import { Video, Users, LineChart } from 'lucide-react';

export default function InstructorCTA() {
  return (
    <section className="section container">
      <div className="instructor-band">
        <div>
          <h2>Share what you know</h2>
          <p>Build a course from YouTube videos you already have, add quizzes, and follow how your students progress. Instructor accounts are reviewed by our team before they are activated.</p>
          <Link to="/contact?subject=instructor" className="btn btn-brand btn-lg">Become an instructor</Link>
        </div>
        <ul className="instructor-points">
          <li><Video size={20} aria-hidden="true" /> Organise videos into sections and lessons</li>
          <li><Users size={20} aria-hidden="true" /> Message and support enrolled students</li>
          <li><LineChart size={20} aria-hidden="true" /> See enrollments and completion in your dashboard</li>
        </ul>
      </div>
    </section>
  );
}
