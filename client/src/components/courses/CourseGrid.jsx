import { SearchX } from 'lucide-react';
import CourseCard, { CourseCardSkeleton } from './CourseCard.jsx';
import StateBox from '../common/StateBox.jsx';

export default function CourseGrid({ courses, loading, error, onRetry, emptyTitle = 'No courses found', emptyMessage, emptyAction, skeletons = 6 }) {
  if (error) {
    return <StateBox icon={SearchX} title="We could not load courses" message={error} action={<button type="button" className="btn btn-primary" onClick={onRetry}>Try again</button>} />;
  }
  if (loading) {
    return <div className="course-grid">{Array.from({ length: skeletons }, (_, i) => <CourseCardSkeleton key={i} />)}</div>;
  }
  if (!courses?.length) {
    return <StateBox icon={SearchX} title={emptyTitle} message={emptyMessage} action={emptyAction} />;
  }
  return <div className="course-grid">{courses.map((c) => <CourseCard key={c._id} course={c} />)}</div>;
}
