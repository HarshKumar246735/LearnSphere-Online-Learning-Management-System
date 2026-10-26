import { useState } from 'react';
import { ClipboardCheck, Plus, Pencil, Trash2, X } from 'lucide-react';
import PageHeader from '../../components/dashboard/PageHeader.jsx';
import DataState from '../../components/dashboard/DataState.jsx';
import StateBox from '../../components/common/StateBox.jsx';
import ConfirmModal from '../../components/common/ConfirmModal.jsx';
import useFetch from '../../hooks/useFetch.js';
import { useToast } from '../../context/ToastContext.jsx';
import * as api from '../../services/instructorService.js';
import { getQuiz } from '../../services/learningService.js';

const emptyQ = () => ({ prompt: '', options: ['', ''], correctIndex: 0, explanation: '' });
const emptyQuiz = { courseId: '', title: '', description: '', passingScore: 70, timeLimitMinutes: 0, maxAttempts: 0, isRequired: true, showAnswers: true, questions: [emptyQ()] };

function Builder({ initial, courses, editingId, onDone }) {
  const toast = useToast();
  const [q, setQ] = useState(initial);
  const [saving, setSaving] = useState(false);
  const set = (k) => (e) => setQ((s) => ({ ...s, [k]: e.target.type === 'checkbox' ? e.target.checked : e.target.value }));
  const setQuestion = (i, patch) => setQ((s) => ({ ...s, questions: s.questions.map((x, idx) => (idx === i ? { ...x, ...patch } : x)) }));

  const submit = async (e) => {
    e.preventDefault();
    setSaving(true);
    const body = { title: q.title, description: q.description, passingScore: Number(q.passingScore), timeLimitMinutes: Number(q.timeLimitMinutes), maxAttempts: Number(q.maxAttempts),
      isRequired: q.isRequired, showAnswers: q.showAnswers, questions: q.questions.map((x) => ({ prompt: x.prompt, options: x.options, correctIndex: x.correctIndex, explanation: x.explanation })) };
    try {
      if (editingId) await api.updateQuiz(editingId, body); else await api.createQuiz(q.courseId, body);
      toast.success('Quiz saved.'); onDone();
    } catch (err) { toast.error(err.details?.[0] ? `${err.details[0].field}: ${err.details[0].message}` : err.message); } finally { setSaving(false); }
  };

  return (
    <form className="card pad stack" onSubmit={submit}>
      <h2>{editingId ? 'Edit quiz' : 'New quiz'}</h2>
      {!editingId && <div className="field"><label htmlFor="qz-course">Course</label><select id="qz-course" className="select" required value={q.courseId} onChange={set('courseId')}><option value="">Choose a course...</option>{courses.map((c) => <option key={c._id} value={c._id}>{c.title}</option>)}</select></div>}
      <div className="field"><label htmlFor="qz-title">Quiz title</label><input id="qz-title" className="input" required minLength={3} maxLength={120} value={q.title} onChange={set('title')} /></div>
      <div className="field"><label htmlFor="qz-desc">Description</label><input id="qz-desc" className="input" maxLength={500} value={q.description} onChange={set('description')} /></div>
      <div className="form-row three">
        <div className="field"><label htmlFor="qz-pass">Passing score (%)</label><input id="qz-pass" className="input" type="number" min="1" max="100" value={q.passingScore} onChange={set('passingScore')} /></div>
        <div className="field"><label htmlFor="qz-time">Time limit (minutes, 0 = none)</label><input id="qz-time" className="input" type="number" min="0" max="240" value={q.timeLimitMinutes} onChange={set('timeLimitMinutes')} /></div>
        <div className="field"><label htmlFor="qz-att">Attempts (0 = unlimited)</label><input id="qz-att" className="input" type="number" min="0" max="50" value={q.maxAttempts} onChange={set('maxAttempts')} /></div>
      </div>
      <label className="check"><input type="checkbox" checked={q.isRequired} onChange={set('isRequired')} /> Required to earn the certificate</label>
      <label className="check"><input type="checkbox" checked={q.showAnswers} onChange={set('showAnswers')} /> Show correct answers and explanations after submitting</label>

      {q.questions.map((qu, i) => (
        <fieldset key={i} className="q-edit">
          <legend>Question {i + 1}</legend>
          <div className="field"><label htmlFor={`qp-${i}`}>Question</label><input id={`qp-${i}`} className="input" required value={qu.prompt} onChange={(e) => setQuestion(i, { prompt: e.target.value })} /></div>
          {qu.options.map((opt, oi) => (
            <div key={oi} className="opt-edit">
              <input type="radio" name={`correct-${i}`} checked={qu.correctIndex === oi} onChange={() => setQuestion(i, { correctIndex: oi })} aria-label={`Mark option ${oi + 1} as correct`} />
              <input className="input" required value={opt} placeholder={`Option ${oi + 1}`} aria-label={`Option ${oi + 1}`} onChange={(e) => setQuestion(i, { options: qu.options.map((x, k) => (k === oi ? e.target.value : x)) })} />
              {qu.options.length > 2 && <button type="button" className="btn btn-ghost btn-sm" aria-label="Remove option" onClick={() => setQuestion(i, { options: qu.options.filter((_, k) => k !== oi), correctIndex: qu.correctIndex === oi ? 0 : qu.correctIndex > oi ? qu.correctIndex - 1 : qu.correctIndex })}><X size={14} /></button>}
            </div>
          ))}
          {qu.options.length < 6 && <button type="button" className="btn btn-ghost btn-sm" onClick={() => setQuestion(i, { options: [...qu.options, ''] })}><Plus size={14} /> Add option</button>}
          <div className="field"><label htmlFor={`qe-${i}`}>Explanation (optional)</label><input id={`qe-${i}`} className="input" maxLength={500} value={qu.explanation} onChange={(e) => setQuestion(i, { explanation: e.target.value })} /></div>
          {q.questions.length > 1 && <button type="button" className="btn btn-ghost btn-sm" onClick={() => setQ((s) => ({ ...s, questions: s.questions.filter((_, k) => k !== i) }))}>Remove question</button>}
        </fieldset>
      ))}
      <button type="button" className="btn btn-ghost" onClick={() => setQ((s) => ({ ...s, questions: [...s.questions, emptyQ()] }))}><Plus size={16} /> Add question</button>
      <div className="lesson-actions"><button type="submit" className="btn btn-primary" disabled={saving}>{saving ? 'Saving...' : 'Save quiz'}</button><button type="button" className="btn btn-ghost" onClick={onDone}>Cancel</button></div>
    </form>
  );
}

export default function InstructorQuizzes() {
  const toast = useToast();
  const quizzes = useFetch((s) => api.getMyQuizzes(s), []);
  const courses = useFetch((s) => api.getMyCourses(s), []);
  const [mode, setMode] = useState(null); // null | { initial, editingId }
  const [del, setDel] = useState(null);

  const edit = async (id) => {
    try {
      const { quiz } = (await getQuiz(id)).data.data;
      setMode({ editingId: id, initial: { ...emptyQuiz, ...quiz, courseId: quiz.course, questions: quiz.questions.map((x) => ({ prompt: x.prompt, options: x.options, correctIndex: x.correctIndex, explanation: x.explanation || '' })) } });
    } catch (e) { toast.error(e.message); }
  };

  if (mode) return <><PageHeader title="Quizzes" /><Builder {...mode} courses={courses.data || []} onDone={() => { setMode(null); quizzes.reload(); }} /></>;
  return (
    <>
      <PageHeader title="Quizzes" subtitle="Multiple-choice quizzes, scored by the server." action={<button type="button" className="btn btn-primary" onClick={() => setMode({ initial: emptyQuiz })} disabled={!courses.data?.length}>New quiz</button>} />
      <DataState loading={quizzes.loading} error={quizzes.error} onRetry={quizzes.reload}>
        {quizzes.data?.length === 0 ? <StateBox icon={ClipboardCheck} title="No quizzes yet" message={courses.data?.length ? 'Create a quiz for one of your courses.' : 'Create a course first, then add quizzes to it.'} /> : (
          <div className="table-wrap"><table className="table">
            <thead><tr><th>Quiz</th><th>Course</th><th>Questions</th><th>Attempts</th><th>Avg score</th><th>Passed</th><th><span className="sr-only">Actions</span></th></tr></thead>
            <tbody>{quizzes.data?.map((q) => (
              <tr key={q._id}><td><strong>{q.title}</strong><br /><small className="muted">{q.isRequired ? 'Required' : 'Optional'} · pass {q.passingScore}%</small></td><td>{q.course?.title}</td><td>{q.questionCount}</td>
                <td>{q.stats.attempts}</td><td>{q.stats.attempts ? `${q.stats.avgScore}%` : '-'}</td><td>{q.stats.passed}</td>
                <td><div className="row-actions"><button type="button" className="btn btn-ghost btn-sm" onClick={() => edit(q._id)} aria-label={`Edit ${q.title}`}><Pencil size={14} /></button>
                  <button type="button" className="btn btn-ghost btn-sm" onClick={() => setDel(q)} aria-label={`Delete ${q.title}`}><Trash2 size={14} /></button></div></td></tr>
            ))}</tbody>
          </table></div>
        )}
      </DataState>
      <ConfirmModal open={Boolean(del)} danger title="Delete this quiz?" message="Students' attempts at this quiz will be deleted too." confirmLabel="Delete quiz" onCancel={() => setDel(null)}
        onConfirm={async () => { try { await api.deleteQuiz(del._id); toast.success('Quiz deleted.'); quizzes.reload(); } catch (e) { toast.error(e.message); } setDel(null); }} />
    </>
  );
}
