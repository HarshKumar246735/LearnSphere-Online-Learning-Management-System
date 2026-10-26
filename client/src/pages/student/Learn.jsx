import { useEffect, useMemo, useState } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import { CheckCircle2, Circle, ChevronLeft, ChevronRight, Award, ClipboardCheck, Link2, Eye } from 'lucide-react';
import YouTubePlayer from '../../components/lessons/YouTubePlayer.jsx';
import DiscussionPanel from '../../components/chat/DiscussionPanel.jsx';
import ProgressBar from '../../components/dashboard/ProgressBar.jsx';
import DataState from '../../components/dashboard/DataState.jsx';
import useFetch from '../../hooks/useFetch.js';
import { useToast } from '../../context/ToastContext.jsx';
import { getLearnContent, completeLesson } from '../../services/learningService.js';
import { formatDuration } from '../../utils/format.js';

export default function Learn() {
  const { courseSlug } = useParams();
  const [params, setParams] = useSearchParams();
  const toast = useToast();
  const { data, loading, error, reload } = useFetch((signal) => getLearnContent(courseSlug, signal), [courseSlug]);
  const [progress, setProgress] = useState(null);
  const [tab, setTab] = useState('notes');
  const [videoEnded, setVideoEnded] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => { if (data) setProgress(data.progress); }, [data]);

  const lessons = useMemo(() => (data ? data.sections.flatMap((s) => s.lessons.map((l) => ({ ...l, sectionTitle: s.title }))) : []), [data]);
  const currentId = params.get('lesson') || data?.lastLessonId || lessons.find((l) => !progress?.completedLessonIds.includes(String(l._id)))?._id || lessons[0]?._id;
  const index = lessons.findIndex((l) => String(l._id) === String(currentId));
  const lesson = lessons[index] || lessons[0];
  const done = (id) => progress?.completedLessonIds.includes(String(id));

  useEffect(() => { setVideoEnded(false); }, [lesson?._id]);

  const go = (target) => { if (target) setParams({ lesson: target._id }, { replace: true }); };

  const markComplete = async () => {
    setSaving(true);
    try {
      const res = await completeLesson(lesson._id);
      const next = res.data.data;
      setProgress(next);
      if (next.certificateId && !progress?.certificateId) toast.success('You completed the course. Your certificate is ready!');
      else toast.success('Lesson marked as completed.');
      if (index < lessons.length - 1) go(lessons[index + 1]);
    } catch (err) { toast.error(err.message); } finally { setSaving(false); }
  };

  return (
    <DataState loading={loading} error={error} onRetry={reload} rows={3}>
      {data && (
        <div className="learn-layout">
          <div className="learn-main">
            <div className="learn-head">
              <Link to="/student/courses" className="muted">&larr; My courses</Link>
              <h1>{data.course.title}</h1>
              {progress && <div className="learn-progress"><ProgressBar percent={progress.percent} label="Course progress" /><span>{progress.percent}% complete ({progress.completedLessons}/{progress.totalLessons})</span></div>}
              {data.isPreviewMode && <p className="alert alert-info"><Eye size={16} /> Preview mode: progress is not tracked.</p>}
            </div>

            {!lesson ? <p className="muted">This course has no lessons yet.</p> : (
              <>
                <YouTubePlayer videoId={lesson.youtubeVideoId} isShort={lesson.isShort} title={lesson.title} onEnded={() => setVideoEnded(true)} />
                <div className="lesson-bar">
                  <div><h2>{lesson.title}</h2><p className="muted">{lesson.sectionTitle}{lesson.durationMinutes ? ` · ${formatDuration(lesson.durationMinutes)}` : ''}</p></div>
                  <div className="lesson-actions">
                    <button type="button" className="btn btn-ghost btn-sm" onClick={() => go(lessons[index - 1])} disabled={index <= 0}><ChevronLeft size={16} /> Previous</button>
                    <button type="button" className="btn btn-ghost btn-sm" onClick={() => go(lessons[index + 1])} disabled={index >= lessons.length - 1}>Next <ChevronRight size={16} /></button>
                    {!data.isPreviewMode && (done(lesson._id)
                      ? <span className="badge badge-success"><CheckCircle2 size={14} /> Completed</span>
                      : <button type="button" className={`btn btn-sm ${videoEnded ? 'btn-brand pulse' : 'btn-primary'}`} onClick={markComplete} disabled={saving}>{saving ? 'Saving...' : 'Mark as completed'}</button>)}
                  </div>
                </div>
                {videoEnded && !done(lesson._id) && !data.isPreviewMode && <p className="alert alert-info" role="status">The video has finished. Mark the lesson as completed when you are ready.</p>}

                <div className="tabs" role="tablist">
                  {[['notes', 'About this lesson'], ['discussion', 'Discussion'], ['quizzes', `Quizzes (${data.quizzes.length})`]].map(([key, label]) => (
                    <button key={key} type="button" role="tab" aria-selected={tab === key} className={`tab${tab === key ? ' active' : ''}`} onClick={() => setTab(key)}>{label}</button>
                  ))}
                </div>
                {tab === 'notes' && (
                  <div className="card pad">
                    <p className="prose-pre">{lesson.description || 'No notes for this lesson.'}</p>
                    {lesson.resources?.length > 0 && (<><h3>Resources</h3><ul className="bullets">{lesson.resources.map((r) => <li key={r.url}><a href={r.url} target="_blank" rel="noopener noreferrer"><Link2 size={14} /> {r.label}</a></li>)}</ul></>)}
                  </div>
                )}
                {tab === 'discussion' && <DiscussionPanel courseId={data.course._id} />}
                {tab === 'quizzes' && (
                  <div className="card pad stack">
                    {data.quizzes.length === 0 ? <p className="muted">This course has no quizzes.</p> : data.quizzes.map((q) => (
                      <div key={q._id} className="row-between">
                        <div><strong>{q.title}</strong><p className="muted">{q.isRequired ? 'Required for the certificate' : 'Optional'} · pass mark {q.passingScore}%</p></div>
                        {q.passed ? <span className="badge badge-success">Passed</span> : data.isPreviewMode ? null : <Link to={`/student/quizzes/${q._id}`} className="btn btn-primary btn-sm"><ClipboardCheck size={14} /> Take quiz</Link>}
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>

          <aside className="learn-side card">
            <h2>Course content</h2>
            {data.sections.map((s) => (
              <div key={s._id} className="learn-section">
                <h3>{s.title}</h3>
                <ul>
                  {s.lessons.map((l) => (
                    <li key={l._id}>
                      <button type="button" className={`learn-item${String(l._id) === String(lesson?._id) ? ' active' : ''}`} onClick={() => go(l)}>
                        {done(l._id) ? <CheckCircle2 size={18} className="ok" /> : <Circle size={18} />}
                        <span>{l.title}</span>
                        {l.durationMinutes > 0 && <small>{formatDuration(l.durationMinutes)}</small>}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
            {progress && !progress.requiredQuizzesPassed && progress.requiredQuizzes > 0 && <p className="field-hint">Pass the required quiz{progress.requiredQuizzes > 1 ? 'zes' : ''} to earn your certificate.</p>}
            {(progress?.certificateId || data.certificateId) && <Link to="/student/certificates" className="btn btn-brand btn-block"><Award size={16} /> View certificate</Link>}
          </aside>
        </div>
      )}
    </DataState>
  );
}
