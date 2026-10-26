import { Navigate, Outlet, useLocation, Link } from 'react-router-dom';
import { ShieldAlert } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';
import StateBox from '../components/common/StateBox.jsx';
import Skeleton from '../components/common/Skeleton.jsx';
import { dashboardPath } from '../utils/roles.js';

// Client-side gating is only for navigation. Every API call is authorised again on the server.
export default function ProtectedRoute({ roles }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) return <div className="container page-section"><Skeleton height={28} width="40%" /></div>;
  if (!user) return <Navigate to={`/login?next=${encodeURIComponent(location.pathname + location.search)}`} replace />;
  if (roles && !roles.includes(user.role)) {
    return (
      <div className="container page-section">
        <StateBox icon={ShieldAlert} title="You do not have access to this page" message="This area is for a different type of account."
          action={<Link to={dashboardPath(user.role)} className="btn btn-primary">Go to my dashboard</Link>} />
      </div>
    );
  }
  return <Outlet />;
}
