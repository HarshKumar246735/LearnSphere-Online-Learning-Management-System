import { Clock, Hammer, TrendingUp, UserCheck, ClipboardCheck, Award } from 'lucide-react';

const reasons = [
  [Clock, 'Learn at your own pace', 'Pause, rewind and pick up where you left off on any device.'],
  [Hammer, 'Practical learning', 'Lessons focus on skills you can use straight away.'],
  [TrendingUp, 'Progress tracking', 'See which lessons you have finished and what comes next.'],
  [UserCheck, 'Expert instructors', 'Courses are created and maintained by real instructors who answer your questions.'],
  [ClipboardCheck, 'Quizzes and assessments', 'Check what you have learned and get instant, scored feedback.'],
  [Award, 'Certificates of completion', 'Finish a course and earn a certificate anyone can verify online.'],
];

export default function WhyChoose() {
  return (
    <section className="section container">
      <div className="section-head"><div><h2>Why choose LearnSphere</h2><p>Everything you need to learn, practise and prove it.</p></div></div>
      <div className="why-grid">
        {reasons.map(([Icon, title, text]) => (
          <div key={title} className="why-item">
            <span className="why-icon"><Icon size={22} aria-hidden="true" /></span>
            <h3>{title}</h3>
            <p>{text}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
