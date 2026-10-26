import { Link } from 'react-router-dom';

export default function Logo({ to = '/' }) {
  return (
    <Link to={to} className="logo" aria-label="LearnSphere home">
      <span className="logo-mark" aria-hidden="true" />
      LearnSphere
    </Link>
  );
}
