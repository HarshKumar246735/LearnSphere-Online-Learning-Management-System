import useFetch from '../../hooks/useFetch.js';
import { getStats } from '../../services/courseService.js';

const items = [
  ['courses', 'Published courses'],
  ['students', 'Registered students'],
  ['instructors', 'Instructors'],
  ['completedCourses', 'Completed courses'],
];

// Real numbers only. Anything that is zero (a brand-new platform) is hidden rather than shown as "0".
export default function StatsStrip() {
  const { data } = useFetch((signal) => getStats(signal), []);
  const visible = data ? items.filter(([key]) => data[key] > 0) : [];
  if (!visible.length) return null;
  return (
    <section className="container stats-strip" aria-label="Platform statistics">
      {visible.map(([key, label]) => (
        <div key={key} className="stat">
          <strong>{data[key].toLocaleString()}</strong>
          <span>{label}</span>
        </div>
      ))}
    </section>
  );
}
