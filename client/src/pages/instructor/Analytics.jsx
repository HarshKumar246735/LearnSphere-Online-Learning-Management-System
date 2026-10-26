import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, BarChart, Bar } from 'recharts';
import PageHeader from '../../components/dashboard/PageHeader.jsx';
import DataState from '../../components/dashboard/DataState.jsx';
import useFetch from '../../hooks/useFetch.js';
import { getInstructorAnalytics } from '../../services/instructorService.js';

export default function Analytics() {
  const { data, loading, error, reload } = useFetch((s) => getInstructorAnalytics(s), []);
  const totalReviews = data?.ratingDistribution.reduce((a, r) => a + r.count, 0) || 0;
  return (
    <>
      <PageHeader title="Analytics" subtitle="Enrollments and ratings across your courses." />
      <DataState loading={loading} error={error} onRetry={reload}>
        {data && (
          <div className="grid-2">
            <section className="card pad"><h2>Enrollments, last 6 months</h2>
              <div className="chart-box" role="img" aria-label="Line chart of enrollments per month">
                <ResponsiveContainer width="100%" height={260}><LineChart data={data.enrollmentsByMonth}><CartesianGrid strokeDasharray="3 3" vertical={false} /><XAxis dataKey="month" tick={{ fontSize: 12 }} /><YAxis allowDecimals={false} /><Tooltip /><Line type="monotone" dataKey="enrollments" stroke="#5a4bd8" strokeWidth={3} dot /></LineChart></ResponsiveContainer>
              </div></section>
            <section className="card pad"><h2>Rating distribution</h2>
              {totalReviews === 0 ? <p className="muted">No reviews yet.</p> : (
                <div className="chart-box" role="img" aria-label="Bar chart of review counts by star rating">
                  <ResponsiveContainer width="100%" height={260}><BarChart data={data.ratingDistribution.map((r) => ({ ...r, name: `${r.star}★` }))}><CartesianGrid strokeDasharray="3 3" vertical={false} /><XAxis dataKey="name" /><YAxis allowDecimals={false} /><Tooltip /><Bar dataKey="count" name="Reviews" fill="#f5a623" radius={[6, 6, 0, 0]} /></BarChart></ResponsiveContainer>
                </div>
              )}</section>
          </div>
        )}
      </DataState>
    </>
  );
}
