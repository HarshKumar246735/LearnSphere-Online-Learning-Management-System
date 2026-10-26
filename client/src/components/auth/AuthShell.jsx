import Logo from '../common/Logo.jsx';

export default function AuthShell({ title, subtitle, children, footer }) {
  return (
    <section className="auth">
      <div className="auth-form-side">
        <div className="auth-card">
          <Logo />
          <div className="auth-head">
            <h1>{title}</h1>
            {subtitle && <p>{subtitle}</p>}
          </div>
          {children}
          {footer && <p className="auth-footer">{footer}</p>}
        </div>
      </div>
      <aside className="auth-art" aria-hidden="true">
        <div className="auth-art-card">
          <h2>Learn at your own pace</h2>
          <p>Video lessons, quizzes and certificates, all in one place.</p>
          <ul>
            <li>Pick up exactly where you left off</li>
            <li>Track progress across every course</li>
            <li>Earn certificates you can verify</li>
          </ul>
        </div>
      </aside>
    </section>
  );
}
