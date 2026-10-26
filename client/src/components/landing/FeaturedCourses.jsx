import { Link } from 'react-router-dom';
import CourseGrid from '../courses/CourseGrid.jsx';
import useFetch from '../../hooks/useFetch.js';
import { getFeaturedCourses } from '../../services/courseService.js';

export default function FeaturedCourses() {
  const { data, loading, error, reload } = useFetch((signal) => getFeaturedCourses(signal), []);
  return (
    <section className="section container" id="featured">
      <div className="section-head">
        <div>
          <h2>Featured courses</h2>
          <p>Popular picks from our instructors.</p>
        </div>
        <Link to="/courses" className="btn btn-ghost">Browse all courses</Link>
      </div>
      <CourseGrid
        courses={data}
        loading={loading}
        error={error}
        onRetry={reload}
        emptyTitle="Courses are on their way"
        emptyMessage="Published courses will show up here."
        emptyAction={<Link to="/contact?subject=instructor" className="btn btn-primary">Teach a course</Link>}
        skeletons={3}
      />
    </section>
  );
}
