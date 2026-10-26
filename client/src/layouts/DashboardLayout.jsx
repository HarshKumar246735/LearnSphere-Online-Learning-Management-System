import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Menu } from 'lucide-react';
import Sidebar from '../components/layout/Sidebar.jsx';

export default function DashboardLayout({ role, user, counts, onLogout }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="dash">
      <a href="#dash-main" className="skip-link">Skip to content</a>
      <Sidebar role={role} user={user} counts={counts} open={open} onNavigate={() => setOpen(false)} onLogout={onLogout} />
      {open && <div className="dash-scrim" onClick={() => setOpen(false)} aria-hidden="true" />}
      <main id="dash-main" className="dash-main">
        <div className="dash-topbar">
          <button type="button" className="btn btn-ghost btn-sm dash-menu-btn" onClick={() => setOpen(true)} aria-label="Open navigation">
            <Menu size={18} />
          </button>
        </div>
        <Outlet />
      </main>
    </div>
  );
}
