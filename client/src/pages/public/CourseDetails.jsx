import { Link, useNavigate, useParams } from 'react-router-dom';
import { Clock, PlayCircle, Star, Globe, BarChart3, Check, Lock, Eye } from 'lucide-react';
import NotFound from './NotFound.jsx';
import Skeleton from '../../components/common/Skeleton.jsx';
import StateBox from '../../components/common/StateBox.jsx';
import { CourseThumb } from '../../components/courses/CourseCard.jsx';
import ReviewSection from '../../components/courses/ReviewSection.jsx';
import useFetch from '../../hooks/useFetch.js';
import { useAuth } from '../../context/AuthContext.jsx';
import { useToast } from '../../context/ToastContext.jsx';
import { getCourse, enrollInCourse } from '../../services/courseService.js';
import { formatDate, formatDuration, formatPrice, levelLabel, initials } from '../../utils/format.js';
import { useState } from 'react';

function EnrollPanel({ course }) {
  const { user } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const [busy, setBusy] = useState(false);
  const here = `/courses/${course.slug}`;

  const enroll = async () => {
    setBusy(true);
    try {
      await enrollInCourse(course._id);
      toast.success('You are enrolled. Happy learning!');
      navigate(`/student/learn/${course.slug}`);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setBusy(false);
    }
  };

  if (course.price > 0) {
    return (
      <>
        <button type="button" className="btn btn-primary btn-lg btn-block" disabled>Checkout unavailable</button>
        <p className="field-hint">Payments are not available yet, so paid courses cannot be purchased.</p>
      </>
    );
  }
  if (!user) {
    return (
      <>
        <Link to={`/login?next=${encodeURIComponent(here)}`} className="btn btn-primary btn-lg btn-block">Log in to enroll</Link>
        <p className="field-hint">New here? <Link to="/register">Create a free account</Link></p>
      </>
    );
  }
  if (user.role !== 'student') return <p className="field-hint">Enrollment is available to student accounts.</p>;
  return <button type="button" className="btn btn-primary btn-lg btn-block" onClick={enroll} disabled={busy}>{busy ? 'Enrolling...' : 'Enroll for free'}</button>;
}

export default function CourseDetails() {
  const { slug } = useParams();
  const { data: course, loading, error, status, reload } = useFetch((signal) => getCourse(slug, signal), [slug]);

  if (status === 404) return <NotFound />;
  if (error) {
    return (
      <div className="container page-section">
        <StateBox title="We could not load this course" message={error} action={<button type="button" className="btn btn-primary" onClick={reload}>Try again</button>} />
      </div>
    );
  }
  if (loading || !course) {
    return (
      <div className="container page-section" aria-busy="true">
        <Skeleton height={36} width="60%" /><div style={{ height: 12 }} /><Skeleton height={18} width="40%" /><div style={{ height: 24 }} /><Skeleton height={320} radius="18px" />
      </div>
    );
  }

  const hasRating = course.ratingCount > 0;
  return (
    <>
      <section className="cd-hero">
        <div className="container cd-hero-inner">
          <div>
            <Link to={`/categories/${course.category?.slug}`} className="badge">{course.category?.name}</Link>
            <h1>{course.title}</h1>
            <p className="cd-lead">{course.shortDescription}</p>
            <ul className="cd-meta">
              <li><span className="avatar">{initials(course.instructor?.name)}</span> {course.instructor?.name}</li>
              {hasRating && <li><Star size={16} fill="currentColor" aria-hidden="true" /> {course.ratingAvg.toFixed(1)} ({course.ratingCount} {course.ratingCount === 1 ? 'review' : 'reviews'})</li>}
              <li><BarChart3 size={16} aria-hidden="true" /> {levelLabel(course.level)}</li>
              <li><Clock size={16} aria-hidden="true" /> {formatDuration(course.durationMinutes)}</li>
              <li><PlayCircle size={16} aria-hidden="true" /> {course.lessonsCount} lessons</li>
              <li><Globe size={16} aria-hidden="true" /> {course.language}</li>
            </ul>
          </div>
        </div>
      </section>

      <div className="container cd-layout">
        <div className="cd-main">
          <section className="card cd-block">
            <h2>About this course</h2>
            <p className="cd-prose">{course.description}</p>
          </section>

          {course.learningObjectives.length > 0 && (
            <section className="card cd-block">
              <h2>What you will learn</h2>
              <ul className="check-list">
                {course.learningObjectives.map((o) => <li key={o}><Check size={18} aria-hidden="true" /> {o}</li>)}
              </ul>
            </section>
          )}

          {course.prerequisites.length > 0 && (
            <section className="card cd-block">
              <h2>Before you start</h2>
              <ul className="bullets">{course.prerequisites.map((p) => <li key={p}>{p}</li>)}</ul>
            </section>
          )}

          <section className="card cd-block">
            <h2>Course content</h2>
            {course.sections.length === 0 ? (
              <p className="muted">The instructor has not added lessons yet.</p>
            ) : (
              <div className="curriculum">
                {course.sections.map((s, i) => (
                  <details key={s._id} className="cur-section" open={i === 0}>
                    <summary>{s.title} <small>{s.lessons.length} {s.lessons.length === 1 ? 'lesson' : 'lessons'}</small></summary>
                    <ul>
                      {s.lessons.map((l) => (
                        <li key={l._id}>
                          {l.isPreview ? <Eye size={16} aria-hidden="true" /> : <Lock size={16} aria-hidden="true" />}
                          <span>{l.title}</span>
                          {l.isPreview && <span className="badge">Free preview</span>}
                          <small>{l.durationMinutes ? formatDuration(l.durationMinutes) : ''}</small>
                        </li>
                      ))}
                    </ul>
                  </details>
                ))}
              </div>
            )}
          </section>

          <section className="card cd-block">
            <h2>Your instructor</h2>
            <div className="instructor-card">
              <span className="avatar avatar-lg">{initials(course.instructor?.name)}</span>
              <div>
                <strong>{course.instructor?.name}</strong>
                {course.instructor?.headline && <p className="muted">{course.instructor.headline}</p>}
                {course.instructor?.bio && <p className="cd-prose">{course.instructor.bio}</p>}
              </div>
            </div>
          </section>

          <section className="card cd-block">
            <h2>Reviews</h2>
            <ReviewSection courseId={course._id} onChanged={reload} />
            {course.reviews.length === 0 ? <p className="muted">No reviews yet. Enrolled students can leave the first one.</p> : (
              <ul className="reviews">
                {course.reviews.map((r) => (
                  <li key={r._id}>
                    <div className="review-head"><strong>{r.student?.name}</strong>
                      <span className="stars" aria-label={`${r.rating} out of 5`}>{'★'.repeat(r.rating)}{'☆'.repeat(5 - r.rating)}</span>
                      <small>{formatDate(r.createdAt)}</small>
                    </div>
                    {r.comment && <p>{r.comment}</p>}
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>

        <aside className="cd-side card">
          <CourseThumb course={course} />
          <div className="cd-side-body">
            <strong className="cd-price">{formatPrice(course.price)}</strong>
            <EnrollPanel course={course} />
            <ul className="cd-facts">
              <li><PlayCircle size={16} aria-hidden="true" /> {course.lessonsCount} video lessons</li>
              <li><Clock size={16} aria-hidden="true" /> {formatDuration(course.durationMinutes)} of content</li>
              <li><Globe size={16} aria-hidden="true" /> Taught in {course.language}</li>
            </ul>
          </div>
        </aside>
      </div>
    </>
  );
}
