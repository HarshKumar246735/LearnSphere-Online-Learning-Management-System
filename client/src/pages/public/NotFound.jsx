import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <section className="container not-found">
      <div style={{ textAlign: 'center', display: 'grid', gap: '1rem', justifyItems: 'center' }}>
        <span className="code">404</span>
        <h1>We could not find that page</h1>
        <p style={{ color: 'var(--ink-500)' }}>The link may be broken, or the page may have moved.</p>
        <Link to="/" className="btn btn-primary">Back to home</Link>
      </div>
    </section>
  );
}
