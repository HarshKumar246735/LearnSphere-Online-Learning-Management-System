import { NavLink } from 'react-router-dom';
import { LogOut } from 'lucide-react';
import Logo from '../common/Logo.jsx';
import { dashboardNav } from '../../utils/navigation.js';

// `counts` maps a badge key (e.g. "messages") to a number; wired to Socket.IO data in Phase 7.
export default function Sidebar({ role, user, counts = {}, open, onNavigate, onLogout }) {
  const groups = dashboardNav[role] || [];
  const initials = (user?.name || 'U').split(' ').map((p) => p[0]).slice(0, 2).join('').toUpperCase();

  return (
    <aside className={`dash-sidebar${open ? ' open' : ''}`} aria-label="Dashboard navigation">
      <div className="dash-brand"><Logo /></div>
      <nav className="dash-nav">
        {groups.map((g) => (
          <div key={g.group}>
            <p className="dash-group-label">{g.group}</p>
            {g.items.map(({ to, label, icon: Icon, badge }) => (
              <NavLink key={to} to={to} onClick={onNavigate} className={({ isActive }) => `dash-link${isActive ? ' active' : ''}`}>
                <Icon size={18} aria-hidden="true" />
                {label}
                {badge && counts[badge] > 0 && <span className="count" aria-label={`${counts[badge]} unread`}>{counts[badge]}</span>}
              </NavLink>
            ))}
          </div>
        ))}
      </nav>
      <div className="dash-user">
        <span className="dash-avatar" aria-hidden="true">{initials}</span>
        <div className="dash-user-meta">
          <strong>{user?.name || 'Your account'}</strong>
          <span style={{ textTransform: 'capitalize' }}>{role}</span>
        </div>
        <button type="button" className="dash-logout" onClick={onLogout} aria-label="Log out"><LogOut size={18} /></button>
      </div>
    </aside>
  );
}
