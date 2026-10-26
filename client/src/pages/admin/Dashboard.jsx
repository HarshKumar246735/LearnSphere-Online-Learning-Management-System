import { Users, BookOpen, GraduationCap, Flag, Award, Star } from 'lucide-react';
import PageHeader from '../../components/dashboard/PageHeader.jsx';
import StatCard from '../../components/dashboard/StatCard.jsx';
import DataState from '../../components/dashboard/DataState.jsx';
import useFetch from '../../hooks/useFetch.js';
import { getAdminDashboard } from '../../services/adminService.js';
import { formatDate } from '../../utils/format.js';

export default function AdminDashboard() {
  const { data, loading, error, reload } = useFetch((s) => getAdminDashboard(s), []);
  return (
    <>
      <PageHeader title="Platform overview" subtitle="Live numbers from the database." />
      <DataState loading={loading} error={error} onRetry={reload}>
        {data && (
          <div className="stack-lg">
            <div className="stat-grid">
              <StatCard icon={Users} label="Students" value={data.users.students} />
              <StatCard icon={GraduationCap} label="Instructors" value={data.users.instructors} tone="sky" />
              <StatCard icon={BookOpen} label="Published courses" value={data.courses.published} tone="mint" hint={`${data.courses.draft} draft, ${data.courses.suspended} suspended`} />
              <StatCard icon={Users} label="Enrollments" value={data.enrollments} tone="amber" />
              <StatCard icon={Star} label="Reviews" value={data.reviews} tone="amber" />
              <StatCard icon={Award} label="Certificates" value={data.certificates} tone="mint" />
              <StatCard icon={Flag} label="Open reports" value={data.openReports} tone="rose" />
            </div>
            <section className="card pad"><h2>Newest members</h2>
              <ul className="activity">{data.recentUsers.map((u) => <li key={u._id}><Users size={18} /><div><strong>{u.name}</strong><p className="muted">{u.email} · {u.role} · joined {formatDate(u.createdAt)}</p></div></li>)}</ul></section>
          </div>
        )}
      </DataState>
    </>
  );
}
