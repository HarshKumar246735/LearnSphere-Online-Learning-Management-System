import { Link } from 'react-router-dom';

export default function About() {
  return (
    <section className="container page-section narrow prose">
      <h1>About LearnSphere</h1>
      <p>LearnSphere is an online learning platform where instructors turn the videos they already have into structured courses, and students learn from them at their own pace.</p>
      <h2>How learning works here</h2>
      <p>Each course is organised into sections and lessons. Lessons play inside LearnSphere, your progress is saved on our servers, quizzes are scored by the server, and certificates are only issued once you have genuinely completed the requirements.</p>
      <h2>For instructors</h2>
      <p>Instructors create courses, add lessons from YouTube videos, build quizzes, and talk to their students. Instructor accounts are reviewed by our team. <Link to="/contact?subject=instructor">Request instructor access</Link>.</p>
      <h2>Our principles</h2>
      <ul>
        <li>No made-up numbers. Statistics, ratings and reviews on this site come from real activity.</li>
        <li>Your data is protected. Passwords are hashed and sessions use secure cookies.</li>
        <li>Learning first. Simple pages, clear progress, nothing that gets in the way.</li>
      </ul>
      <p><Link to="/courses" className="btn btn-primary">Explore courses</Link></p>
    </section>
  );
}
