import { useNavigate } from 'react-router-dom';
import DashboardLayout from './DashboardLayout.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { useSocket } from '../context/SocketContext.jsx';

export default function RoleLayout({ role }) {
  const { user, logout } = useAuth();
  const { counts } = useSocket();
  const navigate = useNavigate();
  return <DashboardLayout role={role} user={user} counts={counts} onLogout={async () => { await logout(); navigate('/'); }} />;
}
