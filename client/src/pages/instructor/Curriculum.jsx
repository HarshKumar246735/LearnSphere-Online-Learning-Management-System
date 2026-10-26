import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowUp, ArrowDown, Pencil, Trash2, Plus, Eye, PlayCircle } from 'lucide-react';
import PageHeader from '../../components/dashboard/PageHeader.jsx';
import DataState from '../../components/dashboard/DataState.jsx';
import ConfirmModal from '../../components/common/ConfirmModal.jsx';
import YouTubePlayer from '../../components/lessons/YouTubePlayer.jsx';
import useFetch from '../../hooks/useFetch.js';
import { useToast } from '../../context/ToastContext.jsx';
import * as api from '../../services/instructorService.js';
import { parseYouTubeUrl } from '../../utils/youtube.js';
import { formatDuration } from '../../utils/format.js';

const blank = { title: '', youtubeUrl: '', durationMinutes: 0, isPreview: false, description: '' };
const move = (list, i, d) => { const a = list.map((x) => x._id); [a[i], a[i + d]] = [a[i + d], a[i]]; return a; };

function LessonForm({ initial, onSave, onCancel, saving }) {
  const [v, setV] = useState(initial);
  const parsed = v.youtubeUrl ? parseYouTubeUrl(v.youtubeUrl) : null;
  const invalid = v.youtubeUrl && !parsed;
  const set = (k) => (e) => setV((s) => ({ ...s, [k]: e.target.type === 'checkbox' ? e.target.checked : e.target.value }));
  return (
    <form className="lesson-form" onSubmit={(e) => { e.preventDefault(); onSave({ ...v, durationMinutes: Number(v.durationMinutes) || 0 }); }}>
      <div className="field"><label htmlFor="l-title">Lesson title</label><input id="l-title" className="input" required minLength={2} maxLength={140} value={v.title} onChange={set('title')} /></div>
      <div className="field"><label htmlFor="l-url">YouTube link</label>
        <input id="l-url" className="input" required placeholder="https://www.youtube.com/watch?v=..." value={v.youtubeUrl} onChange={set('youtubeUrl')} aria-invalid={invalid ? 'true' : 'false'} />
        {invalid && <span className="field-error" role="alert">That does not look like a YouTube watch, youtu.be, embed or shorts link.</span>}
        <span className="field-hint">Videos must allow embedding. Private, removed or embedding-disabled videos will not play.</span></div>
      {parsed && <div className="preview-box"><YouTubePlayer videoId={parsed.videoId} isShort={parsed.isShort} title="Video preview" /></div>}
      <div className="form-row">
        <div className="field"><label htmlFor="l-dur">Duration (minutes)</label><input id="l-dur" className="input" type="number" min="0" max="1000" value={v.durationMinutes} onChange={set('durationMinutes')} /></div>
        <label className="check" style={{ alignSelf: 'end', minHeight: 46 }}><input type="checkbox" checked={v.isPreview} onChange={set('isPreview')} /> Free preview for visitors</label>
      </div>
      <div className="field"><label htmlFor="l-desc">Lesson notes</label><textarea id="l-desc" className="textarea" rows={3} maxLength={3000} value={v.description} onChange={set('description')} /></div>
      <div className="lesson-actions"><button type="submit" className="btn btn-primary btn-sm" disabled={saving || invalid}>{saving ? 'Saving...' : 'Save lesson'}</button><button type="button" className="btn btn-ghost btn-sm" onClick={onCancel}>Cancel</button></div>
    </form>
  );
}

export default function Curriculum() {
  const { id } = useParams();
  const toast = useToast();
  const { data, loading, error, reload } = useFetch((s) => api.getManagedCourse(id, s), [id]);
  const [newSection, setNewSection] = useState('');
  const [editor, setEditor] = useState(null); // { sectionId, lesson? }
  const [renaming, setRenaming] = useState(null);
  const [confirm, setConfirm] = useState(null);
  const [saving, setSaving] = useState(false);

  const run = async (fn, okMsg) => {
    setSaving(true);
    try { await fn(); if (okMsg) toast.success(okMsg); await reload(); return true; } catch (e) { toast.error(e.message); return false; } finally { setSaving(false); }
  };

  return (
    <>
      <PageHeader title={data?.course ? `Curriculum: ${data.course.title}` : 'Curriculum'} subtitle="Organise the course into sections and lessons. Each lesson plays a YouTube video inside LearnSphere."
        action={<div className="lesson-actions"><Link to={`/instructor/courses/${id}/edit`} className="btn btn-ghost">Course details</Link><Link to="/instructor/courses" className="btn btn-primary">Done</Link></div>} />
      <DataState loading={loading} error={error} onRetry={reload}>
        {data && (
          <div className="stack">
            {data.sections.map((s, si) => (
              <section key={s._id} className="card pad section-card">
                <div className="row-between">
                  {renaming?.id === s._id ? (
                    <form className="inline-form" onSubmit={async (e) => { e.preventDefault(); if (await run(() => api.renameSection(s._id, renaming.title), 'Section renamed.')) setRenaming(null); }}>
                      <label className="sr-only" htmlFor="rename">Section title</label>
                      <input id="rename" className="input" value={renaming.title} onChange={(e) => setRenaming({ ...renaming, title: e.target.value })} minLength={2} required />
                      <button type="submit" className="btn btn-primary btn-sm">Save</button><button type="button" className="btn btn-ghost btn-sm" onClick={() => setRenaming(null)}>Cancel</button>
                    </form>
                  ) : <h2>{si + 1}. {s.title}</h2>}
                  <div className="row-actions">
                    <button type="button" className="btn btn-ghost btn-sm" disabled={si === 0 || saving} onClick={() => run(() => api.reorderSections(id, move(data.sections, si, -1)))} aria-label="Move section up"><ArrowUp size={14} /></button>
                    <button type="button" className="btn btn-ghost btn-sm" disabled={si === data.sections.length - 1 || saving} onClick={() => run(() => api.reorderSections(id, move(data.sections, si, 1)))} aria-label="Move section down"><ArrowDown size={14} /></button>
                    <button type="button" className="btn btn-ghost btn-sm" onClick={() => setRenaming({ id: s._id, title: s.title })} aria-label="Rename section"><Pencil size={14} /></button>
                    <button type="button" className="btn btn-ghost btn-sm" onClick={() => setConfirm({ kind: 'section', item: s })} aria-label="Delete section"><Trash2 size={14} /></button>
                  </div>
                </div>
                <ul className="lesson-list">
                  {s.lessons.map((l, li) => (
                    <li key={l._id}>
                      {editor?.lesson?._id === l._id ? (
                        <LessonForm initial={{ title: l.title, youtubeUrl: `https://www.youtube.com/${l.isShort ? 'shorts/' : 'watch?v='}${l.youtubeVideoId}`, durationMinutes: l.durationMinutes, isPreview: l.isPreview, description: l.description }} saving={saving} onCancel={() => setEditor(null)}
                          onSave={async (v) => { if (await run(() => api.updateLesson(l._id, v), 'Lesson updated.')) setEditor(null); }} />
                      ) : (
                        <div className="row-between lesson-row">
                          <span><PlayCircle size={16} /> <strong>{l.title}</strong> {l.isPreview && <span className="badge"><Eye size={12} /> Preview</span>} <small className="muted">{l.durationMinutes ? formatDuration(l.durationMinutes) : ''}</small></span>
                          <span className="row-actions">
                            <button type="button" className="btn btn-ghost btn-sm" disabled={li === 0 || saving} onClick={() => run(() => api.reorderLessons(s._id, move(s.lessons, li, -1)))} aria-label="Move lesson up"><ArrowUp size={14} /></button>
                            <button type="button" className="btn btn-ghost btn-sm" disabled={li === s.lessons.length - 1 || saving} onClick={() => run(() => api.reorderLessons(s._id, move(s.lessons, li, 1)))} aria-label="Move lesson down"><ArrowDown size={14} /></button>
                            <button type="button" className="btn btn-ghost btn-sm" onClick={() => setEditor({ sectionId: s._id, lesson: l })} aria-label="Edit lesson"><Pencil size={14} /></button>
                            <button type="button" className="btn btn-ghost btn-sm" onClick={() => setConfirm({ kind: 'lesson', item: l })} aria-label="Delete lesson"><Trash2 size={14} /></button>
                          </span>
                        </div>
                      )}
                    </li>
                  ))}
                </ul>
                {editor && !editor.lesson && editor.sectionId === s._id
                  ? <LessonForm initial={blank} saving={saving} onCancel={() => setEditor(null)} onSave={async (v) => { if (await run(() => api.addLesson(s._id, v), 'Lesson added.')) setEditor(null); }} />
                  : <button type="button" className="btn btn-ghost btn-sm" onClick={() => setEditor({ sectionId: s._id })}><Plus size={14} /> Add lesson</button>}
              </section>
            ))}
            <form className="card pad inline-form" onSubmit={async (e) => { e.preventDefault(); if (await run(() => api.addSection(id, newSection), 'Section added.')) setNewSection(''); }}>
              <label className="sr-only" htmlFor="new-section">New section title</label>
              <input id="new-section" className="input" placeholder="New section title" value={newSection} onChange={(e) => setNewSection(e.target.value)} minLength={2} maxLength={120} required />
              <button type="submit" className="btn btn-primary" disabled={saving}><Plus size={16} /> Add section</button>
            </form>
          </div>
        )}
      </DataState>
      <ConfirmModal open={Boolean(confirm)} danger title={`Delete this ${confirm?.kind}?`} confirmLabel="Delete" loading={saving}
        message={confirm?.kind === 'section' ? 'The section and all of its lessons will be removed, along with students’ progress on them.' : 'The lesson and students’ progress on it will be removed.'}
        onCancel={() => setConfirm(null)}
        onConfirm={async () => { await run(() => (confirm.kind === 'section' ? api.deleteSection(confirm.item._id) : api.deleteLesson(confirm.item._id)), 'Deleted.'); setConfirm(null); }} />
    </>
  );
}
