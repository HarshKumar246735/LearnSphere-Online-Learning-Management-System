import { Link } from 'react-router-dom';
import { CourseThumb } from '../courses/CourseCard.jsx';
import ProgressBar from './ProgressBar.jsx';

export default function EnrolledCourseCard({ item }) {
  const { course } = item;
  return (
    <article className="learn-card">
      <CourseThumb course={course} />
      <div className="learn-card-body">
        <h3>{course.title}</h3>
        <p className="muted">{course.instructor?.name}</p>
        <ProgressBar percent={item.percent} label={`${course.title} progress`} />
        <div className="learn-card-meta"><span>{item.percent}% complete</span><span>{item.completedLessons} of {course.lessonsCount} lessons</span></div>
        <Link to={`/student/learn/${course.slug}`} className="btn btn-primary btn-sm">{item.status === 'completed' ? 'Review course' : item.completedLessons ? 'Continue learning' : 'Start learning'}</Link>
      </div>
    </article>
  );
}
