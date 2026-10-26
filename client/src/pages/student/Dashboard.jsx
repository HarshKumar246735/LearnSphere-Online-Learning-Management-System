import { Link } from 'react-router-dom';
import { BookOpen, Flame, Award, CheckCircle2, PlayCircle } from 'lucide-react';
import PageHeader from '../../components/dashboard/PageHeader.jsx';
import StatCard from '../../components/dashboard/StatCard.jsx';
import DataState from '../../components/dashboard/DataState.jsx';
import EnrolledCourseCard from '../../components/dashboard/EnrolledCourseCard.jsx';
import CourseCard from '../../components/courses/CourseCard.jsx';
import StateBox from '../../components/common/StateBox.jsx';
import useFetch from '../../hooks/useFetch.js';
import { useAuth } from '../../context/AuthContext.jsx';
import { getStudentDashboard } from '../../services/learningService.js';
import { formatDate } from '../../utils/format.js';

export default function StudentDashboard() {
  const { user } = useAuth();
  const { data, loading, error, reload } = useFetch((s) => getStudentDashboard(s), []);
  return (
    <>
      <PageHeader title={`Welcome back, ${user.name.split(' ')[0]}`} subtitle="Pick up where you left off." action={<Link to="/courses" className="btn btn-primary">Find a course</Link>} />
      <DataState loading={loading} error={error} onRetry={reload}>
        {data && (
          <div className="stack-lg">
            <div className="stat-grid">
              <StatCard icon={BookOpen} label="Enrolled courses" value={data.totals.enrolled} />
              <StatCard icon={PlayCircle} label="In progress" value={data.totals.inProgress} tone="sky" />
              <StatCard icon={CheckCircle2} label="Completed" value={data.totals.completed} tone="mint" />
              <StatCard icon={Award} label="Certificates" value={data.totals.certificates} tone="amber" />
              <StatCard icon={Flame} label="Day streak" value={data.streak} tone="rose" hint={data.streak ? 'Keep it going' : 'Complete a lesson today'} />
            </div>

            <section>
              <div className="section-head"><h2>My learning</h2><Link to="/student/courses" className="btn btn-ghost btn-sm">All courses</Link></div>
              {data.learning.length === 0
                ? <StateBox icon={BookOpen} title="You have not enrolled yet" message="Browse courses and enroll in a free one to get started." action={<Link to="/courses" className="btn btn-primary">Explore courses</Link>} />
                : <div className="grid-3">{data.learning.map((i) => <EnrolledCourseCard key={i._id} item={i} />)}</div>}
            </section>

            <div className="grid-2">
              <section className="card pad">
                <h2>Recent activity</h2>
                {data.recent.length === 0 ? <p className="muted">Lessons you complete will show up here.</p> : (
                  <ul className="activity">{data.recent.map((r) => (
                    <li key={r._id}><CheckCircle2 size={18} className="ok" /><div><strong>{r.lesson}</strong><p className="muted">{r.course.title} · {formatDate(r.completedAt)}</p></div></li>
                  ))}</ul>
                )}
              </section>
              <section className="card pad">
                <h2>Learning streak</h2>
                <p className="big-number">{data.streak} <small>{data.streak === 1 ? 'day' : 'days'}</small></p>
                <p className="muted">A streak counts consecutive days on which you completed at least one lesson.</p>
              </section>
            </div>

            {data.recommended.length > 0 && (
              <section>
                <div className="section-head"><h2>Recommended for you</h2></div>
                <div className="grid-3">{data.recommended.map((c) => <CourseCard key={c._id} course={c} />)}</div>
              </section>
            )}
          </div>
        )}
      </DataState>
    </>
  );
}
