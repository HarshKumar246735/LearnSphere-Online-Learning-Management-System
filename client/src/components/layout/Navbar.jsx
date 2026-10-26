import { useEffect, useState } from 'react';
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import Logo from '../common/Logo.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import { publicLinks } from '../../utils/navigation.js';
import { dashboardPath } from '../../utils/roles.js';

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { user, loading, logout } = useAuth();

  useEffect(() => setOpen(false), [pathname]);

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const renderLink = (link) =>
    link.hash ? (
      <a key={link.to} href={link.to} className="nav-link">{link.label}</a>
    ) : (
      <NavLink key={link.to} to={link.to} end={link.end} className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}>
        {link.label}
      </NavLink>
    );

  return (
    <header className="navbar">
      <div className="container navbar-inner">
        <Logo />
        <nav className="nav-links" aria-label="Main">{publicLinks.map(renderLink)}</nav>
        <div className="nav-actions">
          {!loading && (user ? (
            <>
              <button type="button" className="btn btn-ghost btn-sm nav-login" onClick={handleLogout}>Log out</button>
              <Link to={dashboardPath(user.role)} className="btn btn-primary btn-sm">Dashboard</Link>
            </>
          ) : (
            <>
              <Link to="/login" className="btn btn-ghost btn-sm nav-login">Log in</Link>
              <Link to="/register" className="btn btn-primary btn-sm">Get started</Link>
            </>
          ))}
          <button
            type="button" className="nav-toggle" aria-expanded={open} aria-controls="mobile-nav"
            aria-label={open ? 'Close menu' : 'Open menu'} onClick={() => setOpen((v) => !v)}
          >
            {open ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>
      {open && (
        <nav id="mobile-nav" className="nav-mobile" aria-label="Mobile">
          {publicLinks.map(renderLink)}
          {!loading && (user
            ? <button type="button" className="btn btn-ghost" onClick={handleLogout}>Log out</button>
            : <Link to="/login" className="btn btn-ghost">Log in</Link>)}
        </nav>
      )}
    </header>
  );
}
