import { Link } from 'react-router-dom';
import { Twitter, Linkedin, Github, Youtube } from 'lucide-react';
import Logo from '../common/Logo.jsx';

const social = [
  { href: 'https://twitter.com', label: 'LearnSphere on X', icon: Twitter },
  { href: 'https://www.linkedin.com', label: 'LearnSphere on LinkedIn', icon: Linkedin },
  { href: 'https://github.com', label: 'LearnSphere on GitHub', icon: Github },
  { href: 'https://www.youtube.com', label: 'LearnSphere on YouTube', icon: Youtube },
];

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-grid">
          <div className="footer-about">
            <Logo />
            <p>Video lessons, quizzes and certificates that let you build new skills at your own pace.</p>
            <div className="footer-social">
              {social.map(({ href, label, icon: Icon }) => (
                <a key={label} href={href} target="_blank" rel="noopener noreferrer" aria-label={label}><Icon size={18} /></a>
              ))}
            </div>
          </div>
          <div>
            <h4>Learn</h4>
            <ul className="footer-list">
              <li><Link to="/courses">All courses</Link></li>
              <li><a href="/#categories">Categories</a></li>
              <li><Link to="/certificates/verify/check">Verify a certificate</Link></li>
            </ul>
          </div>
          <div>
            <h4>Company</h4>
            <ul className="footer-list">
              <li><Link to="/about">About</Link></li>
              <li><Link to="/contact">Contact</Link></li>
              <li><Link to="/contact?subject=instructor">Become an instructor</Link></li>
            </ul>
          </div>
          <div>
            <h4>Legal</h4>
            <ul className="footer-list">
              <li><Link to="/privacy">Privacy policy</Link></li>
              <li><Link to="/terms">Terms and conditions</Link></li>
            </ul>
          </div>
        </div>
        <div className="footer-bottom">
          <span>&copy; {new Date().getFullYear()} LearnSphere. All rights reserved.</span>
          <span>Built with the MERN stack.</span>
        </div>
      </div>
    </footer>
  );
}
