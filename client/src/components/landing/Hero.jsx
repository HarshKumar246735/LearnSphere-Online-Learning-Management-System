
import { Link } from 'react-router-dom';
import {
  Award,
  BadgeCheck,
  MonitorSmartphone,
  Tags,
} from 'lucide-react';

const trust = [
  { icon: Tags, text: 'Free and paid courses' },
  { icon: BadgeCheck, text: 'Certificates you can verify' },
  { icon: MonitorSmartphone, text: 'Works on phone and laptop' },
];

export default function Hero() {
  return (
    <section className="hero">
      <div className="container hero-grid">

        {/* Left side: Hero content */}
        <div className="hero-copy">
          <h1>Learn a new skill, one lesson at a time</h1>

          <p>
            Watch video lessons, test yourself with quizzes, track your
            progress and earn a certificate you can share and verify online.
          </p>

          <div className="hero-actions">
            <Link to="/courses" className="btn btn-primary btn-lg">
              Explore courses
            </Link>

            <Link to="/register" className="btn btn-ghost btn-lg">
              Start learning
            </Link>
          </div>

          <ul className="trust-list">
            {trust.map(({ icon: Icon, text }) => (
              <li key={text}>
                <Icon size={18} aria-hidden="true" />
                {text}
              </li>
            ))}
          </ul>
        </div>

        {/* Right side: Downloaded video player */}
        <div className="hero-visual">
          <div className="player-mock hero-video-card">

            <div className="hero-video-screen">
              <video
                className="hero-running-video"
                autoPlay
                loop
                muted
                controls
                playsInline
                preload="metadata"
              >
                <source
                  src="/videos/learnsphere-intro.mp4"
                  type="video/mp4"
                />

                Your browser does not support HTML video.
              </video>
            </div>

            <div className="player-bar">
              <span />
            </div>

            <ul className="player-lessons">
              <li className="done">
                <span className="lesson-check">✓</span>
                Introduction
              </li>

              <li className="done">
                <span className="lesson-check">✓</span>
                Core concepts
              </li>

              <li className="now">
                <span className="lesson-play">▶</span>
                Build your first project
              </li>

              <li>Quiz and review</li>
            </ul>
          </div>

          <div className="cert-chip">
            <Award size={20} />
            Certificate ready
          </div>
        </div>

      </div>
    </section>
  );
}

