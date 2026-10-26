import { useState } from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, Megaphone, Pencil, ListTree, Trash2 } from 'lucide-react';
import PageHeader from '../../components/dashboard/PageHeader.jsx';
import DataState from '../../components/dashboard/DataState.jsx';
import StateBox from '../../components/common/StateBox.jsx';
import ConfirmModal from '../../components/common/ConfirmModal.jsx';
import useFetch from '../../hooks/useFetch.js';
import { useToast } from '../../context/ToastContext.jsx';
import { getMyCourses, setPublished, deleteCourse, sendAnnouncement } from '../../services/instructorService.js';
import { formatPrice } from '../../utils/format.js';

const statusBadge = { published: 'badge-success', draft: 'badge-muted', suspended: 'badge-danger' };

export default function InstructorCourses() {
  const toast = useToast();
  const { data, loading, error, reload } = useFetch((s) => getMyCourses(s), []);
  const [toDelete, setToDelete] = useState(null);
  const [announce, setAnnounce] = useState(null);
  const [busy, setBusy] = useState(false);
  const [note, setNote] = useState({ title: '', message: '' });

  const toggle = async (c) => {
    try { await setPublished(c._id, c.status !== 'published'); toast.success(c.status === 'published' ? 'Course unpublished.' : 'Course published.'); reload(); } catch (e) { toast.error(e.message); }
  };
  const remove = async () => {
    setBusy(true);
    try { await deleteCourse(toDelete._id); toast.success('Course deleted.'); setToDelete(null); reload(); } catch (e) { toast.error(e.message); setToDelete(null); } finally { setBusy(false); }
  };
  const send = async (e) => {
    e.preventDefault();
    setBusy(true);
    try { const res = await sendAnnouncement(announce._id, note); toast.success(`Announcement sent to ${res.data.data.sentTo} student(s).`); setAnnounce(null); setNote({ title: '', message: '' }); } catch (err) { toast.error(err.message); } finally { setBusy(false); }
  };

  return (
    <>
      <PageHeader title="My courses" subtitle="Create, edit and publish your courses." action={<Link to="/instructor/courses/new" className="btn btn-primary">New course</Link>} />
      <DataState loading={loading} error={error} onRetry={reload}>
        {data?.length === 0 ? <StateBox icon={BookOpen} title="You have no courses yet" message="Create a course, add lessons from YouTube videos and publish it." action={<Link to="/instructor/courses/new" className="btn btn-primary">Create a course</Link>} /> : (
          <div className="table-wrap"><table className="table">
            <thead><tr><th>Course</th><th>Status</th><th>Lessons</th><th>Students</th><th>Price</th><th>Rating</th><th><span className="sr-only">Actions</span></th></tr></thead>
            <tbody>{data?.map((c) => (
              <tr key={c._id}>
                <td><strong>{c.title}</strong><br /><small className="muted">{c.category?.name}</small></td>
                <td><span className={`badge ${statusBadge[c.status]}`}>{c.status}</span></td>
                <td>{c.lessonsCount}</td><td>{c.enrollmentCount}</td><td>{formatPrice(c.price)}</td><td>{c.ratingCount ? `${c.ratingAvg.toFixed(1)} (${c.ratingCount})` : '-'}</td>
                <td><div className="row-actions">
                  <Link to={`/instructor/courses/${c._id}/edit`} className="btn btn-ghost btn-sm" aria-label={`Edit ${c.title}`}><Pencil size={14} /></Link>
                  <Link to={`/instructor/courses/${c._id}/curriculum`} className="btn btn-ghost btn-sm" aria-label={`Curriculum for ${c.title}`}><ListTree size={14} /></Link>
                  <button type="button" className="btn btn-ghost btn-sm" onClick={() => setAnnounce(c)} aria-label={`Announce to ${c.title}`}><Megaphone size={14} /></button>
                  <button type="button" className="btn btn-ghost btn-sm" onClick={() => toggle(c)} disabled={c.status === 'suspended'}>{c.status === 'published' ? 'Unpublish' : 'Publish'}</button>
                  <button type="button" className="btn btn-ghost btn-sm" onClick={() => setToDelete(c)} aria-label={`Delete ${c.title}`}><Trash2 size={14} /></button>
                </div></td>
              </tr>
            ))}</tbody>
          </table></div>
        )}
      </DataState>
      <ConfirmModal open={Boolean(toDelete)} title="Delete this course?" message={`"${toDelete?.title}" and its lessons and quizzes will be permanently removed. Courses with enrolled students cannot be deleted.`}
        confirmLabel="Delete course" danger loading={busy} onConfirm={remove} onCancel={() => setToDelete(null)} />
      {announce && (
        <div className="modal-backdrop" onMouseDown={(e) => e.target === e.currentTarget && setAnnounce(null)}>
          <form className="modal" onSubmit={send} role="dialog" aria-modal="true" aria-labelledby="ann-title">
            <h2 id="ann-title">Announce to {announce.title}</h2>
            <div className="field"><label htmlFor="ann-t">Title</label><input id="ann-t" className="input" required minLength={3} maxLength={140} value={note.title} onChange={(e) => setNote({ ...note, title: e.target.value })} /></div>
            <div className="field"><label htmlFor="ann-m">Message</label><textarea id="ann-m" className="textarea" required minLength={3} maxLength={500} rows={4} value={note.message} onChange={(e) => setNote({ ...note, message: e.target.value })} /></div>
            <div className="modal-actions"><button type="button" className="btn btn-ghost" onClick={() => setAnnounce(null)}>Cancel</button><button type="submit" className="btn btn-primary" disabled={busy}>{busy ? 'Sending...' : 'Send to enrolled students'}</button></div>
          </form>
        </div>
      )}
    </>
  );
}
