import { Link } from 'react-router-dom';
import { BookOpen, Globe2, Users, GraduationCap } from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, Legend } from 'recharts';
import PageHeader from '../../components/dashboard/PageHeader.jsx';
import StatCard from '../../components/dashboard/StatCard.jsx';
import DataState from '../../components/dashboard/DataState.jsx';
import StateBox from '../../components/common/StateBox.jsx';
import useFetch from '../../hooks/useFetch.js';
import { getInstructorDashboard } from '../../services/instructorService.js';
import { formatDate } from '../../utils/format.js';

export default function InstructorDashboard() {
  const { data, loading, error, reload } = useFetch((s) => getInstructorDashboard(s), []);
  return (
    <>
      <PageHeader title="Instructor dashboard" subtitle="How your courses are doing." action={<Link to="/instructor/courses/new" className="btn btn-primary">New course</Link>} />
      <DataState loading={loading} error={error} onRetry={reload}>
        {data && (
          <div className="stack-lg">
            <div className="stat-grid">
              <StatCard icon={BookOpen} label="Total courses" value={data.totals.courses} />
              <StatCard icon={Globe2} label="Published" value={data.totals.published} tone="mint" />
              <StatCard icon={Users} label="Enrollments" value={data.totals.enrollments} tone="sky" />
              <StatCard icon={GraduationCap} label="Completions" value={data.totals.completions} tone="amber" />
            </div>
            <section className="card pad">
              <h2>Course performance</h2>
              {data.performance.length === 0 ? <StateBox title="No courses yet" message="Create your first course to see performance here." action={<Link to="/instructor/courses/new" className="btn btn-primary">Create a course</Link>} /> : (
                <div className="chart-box" role="img" aria-label="Bar chart of enrollments and completions per course">
                  <ResponsiveContainer width="100%" height={280}>
                    <BarChart data={data.performance.map((p) => ({ ...p, name: p.title.length > 18 ? `${p.title.slice(0, 17)}…` : p.title }))}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} /><XAxis dataKey="name" tick={{ fontSize: 12 }} /><YAxis allowDecimals={false} /><Tooltip /><Legend />
                      <Bar dataKey="enrollments" name="Enrollments" fill="#5a4bd8" radius={[6, 6, 0, 0]} />
                      <Bar dataKey="completions" name="Completions" fill="#19c3a0" radius={[6, 6, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}
            </section>
            <section className="card pad">
              <h2>Recent enrollments</h2>
              {data.recent.length === 0 ? <p className="muted">Nobody has enrolled yet.</p> : (
                <ul className="activity">{data.recent.map((r) => <li key={r._id}><Users size={18} /><div><strong>{r.student}</strong><p className="muted">{r.course} · {formatDate(r.at)}</p></div></li>)}</ul>
              )}
            </section>
          </div>
        )}
      </DataState>
    </>
  );
}
