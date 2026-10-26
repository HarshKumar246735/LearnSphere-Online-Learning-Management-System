import { Link } from 'react-router-dom';
import { BookOpen, Clock, PlayCircle, Star } from 'lucide-react';
import Skeleton from '../common/Skeleton.jsx';
import { formatDuration, formatPrice, levelLabel } from '../../utils/format.js';

const GRADIENTS = [
  ['#e9e3ff', '#f7e6ff'], ['#dff3ff', '#e9e6ff'], ['#e4f8ef', '#e8f0ff'], ['#ffeadf', '#f6e4ff'], ['#e6ecff', '#e0f7f3'],
];
const pick = (text = '') => GRADIENTS[[...text].reduce((a, c) => a + c.charCodeAt(0), 0) % GRADIENTS.length];

export function CourseThumb({ course, className = '' }) {
  const [from, to] = pick(course.title);
  return (
    <div className={`course-thumb ${className}`} style={{ background: `linear-gradient(135deg, ${from}, ${to})` }}>
      {course.thumbnail ? <img src={course.thumbnail} alt="" loading="lazy" /> : <BookOpen size={44} aria-hidden="true" />}
      {course.category?.name && <span className="pill course-thumb-pill">{course.category.name}</span>}
    </div>
  );
}

export default function CourseCard({ course }) {
  const hasRating = course.ratingCount > 0;
  return (
    <article className="course-card">
      <Link to={`/courses/${course.slug}`} className="course-card-link" aria-label={`${course.title}, view course`}>
        <CourseThumb course={course} />
      </Link>
      <div className="course-card-body">
        <h3 className="course-card-title"><Link to={`/courses/${course.slug}`}>{course.title}</Link></h3>
        <p className="course-card-instructor">{course.instructor?.name}</p>
        <ul className="course-card-meta">
          <li><span className="badge">{levelLabel(course.level)}</span></li>
          <li><Clock size={14} aria-hidden="true" /> {formatDuration(course.durationMinutes)}</li>
          <li><PlayCircle size={14} aria-hidden="true" /> {course.lessonsCount} {course.lessonsCount === 1 ? 'lesson' : 'lessons'}</li>
          {hasRating && <li><Star size={14} aria-hidden="true" fill="currentColor" /> {course.ratingAvg.toFixed(1)} <span className="muted">({course.ratingCount})</span></li>}
        </ul>
        <div className="course-card-foot">
          <strong className={course.price ? '' : 'price-free'}>{formatPrice(course.price)}</strong>
          <Link to={`/courses/${course.slug}`} className="btn btn-ghost btn-sm">View course</Link>
        </div>
      </div>
    </article>
  );
}

export function CourseCardSkeleton() {
  return (
    <div className="course-card" aria-hidden="true">
      <Skeleton height={170} radius="18px" />
      <div className="course-card-body">
        <Skeleton height={20} width="85%" />
        <Skeleton height={14} width="45%" />
        <Skeleton height={14} width="70%" />
        <Skeleton height={36} />
      </div>
    </div>
  );
}
