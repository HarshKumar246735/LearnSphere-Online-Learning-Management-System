import { useEffect, useRef, useState, useCallback } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Check, X, Clock } from 'lucide-react';
import { startQuiz, submitQuiz } from '../../services/learningService.js';
import { useToast } from '../../context/ToastContext.jsx';
import StateBox from '../../components/common/StateBox.jsx';
import Skeleton from '../../components/common/Skeleton.jsx';

const fmt = (s) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;

export default function QuizPlayer() {
  const { quizId } = useParams();
  const toast = useToast();
  const [attempt, setAttempt] = useState(null);
  const [error, setError] = useState('');
  const [answers, setAnswers] = useState([]);
  const [current, setCurrent] = useState(0);
  const [result, setResult] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(null);
  const submittedRef = useRef(false);

  useEffect(() => {
    let active = true;
    startQuiz(quizId)
      .then((res) => { if (!active) return; const d = res.data.data; setAttempt(d); setAnswers(Array(d.quiz.questions.length).fill(null)); })
      .catch((e) => active && setError(e.message));
    return () => { active = false; };
  }, [quizId]);

  const submit = useCallback(async (auto = false) => {
    if (submittedRef.current || !attempt) return;
    submittedRef.current = true;
    setSubmitting(true);
    try {
      const res = await submitQuiz(quizId, { attemptId: attempt.attemptId, answers });
      setResult(res.data.data);
      if (auto) toast.error('Time ran out, so your answers were submitted.');
    } catch (e) { setError(e.message); } finally { setSubmitting(false); }
  }, [attempt, answers, quizId, toast]);

  // The countdown is a courtesy. The server enforces the real deadline.
  useEffect(() => {
    if (!attempt?.expiresAt || result) return undefined;
    const tick = () => {
      const left = Math.max(0, Math.round((new Date(attempt.expiresAt) - Date.now()) / 1000));
      setSecondsLeft(left);
      if (left === 0) submit(true);
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [attempt, result, submit]);

  if (error) return <StateBox title="We could not open this quiz" message={error} action={<Link to="/student/quizzes" className="btn btn-primary">Back to quizzes</Link>} />;
  if (!attempt) return <div className="stack"><Skeleton height={32} width="50%" /><Skeleton height={220} radius="18px" /></div>;
  const { quiz } = attempt;

  if (result) {
    return (
      <div className="quiz-result">
        <div className={`score-ring ${result.passed ? 'pass' : 'fail'}`}><strong>{result.score}%</strong><span>{result.passed ? 'Passed' : 'Not passed'}</span></div>
        <p>{result.correctCount} of {result.totalQuestions} correct. Pass mark {result.passingScore}%.</p>
        {result.certificateId && <p className="alert alert-info">You completed the course. <Link to="/student/certificates">View your certificate</Link></p>}
        <ol className="review-list">
          {quiz.questions.map((q, i) => {
            const r = result.results[i];
            return (
              <li key={q._id} className={r.correct ? 'right' : 'wrong'}>
                <div className="review-q">{r.correct ? <Check size={18} /> : <X size={18} />}<strong>{q.prompt}</strong></div>
                <p>Your answer: {r.selectedIndex == null ? <em>skipped</em> : q.options[r.selectedIndex]}</p>
                {r.correctIndex !== undefined && !r.correct && <p>Correct answer: {q.options[r.correctIndex]}</p>}
                {r.explanation && <p className="muted">{r.explanation}</p>}
              </li>
            );
          })}
        </ol>
        <div className="lesson-actions"><Link to="/student/quizzes" className="btn btn-ghost">All quizzes</Link>{!result.passed && <button type="button" className="btn btn-primary" onClick={() => window.location.reload()}>Try again</button>}</div>
      </div>
    );
  }

  const q = quiz.questions[current];
  const answered = answers.filter((a) => a !== null).length;
  return (
    <div className="quiz-shell">
      <div className="row-between">
        <div><h1>{quiz.title}</h1><p className="muted">Question {current + 1} of {quiz.questions.length} · {answered} answered</p></div>
        {secondsLeft != null && <span className={`badge ${secondsLeft < 60 ? 'badge-danger' : ''}`}><Clock size={14} /> {fmt(secondsLeft)}</span>}
      </div>
      <fieldset className="card pad quiz-q">
        <legend>{q.prompt}</legend>
        {q.options.map((opt, i) => (
          <label key={i} className={`option${answers[current] === i ? ' selected' : ''}`}>
            <input type="radio" name={`q-${current}`} checked={answers[current] === i} onChange={() => setAnswers((a) => a.map((v, idx) => (idx === current ? i : v)))} />
            <span>{opt}</span>
          </label>
        ))}
      </fieldset>
      <div className="quiz-dots" aria-label="Question navigation">
        {quiz.questions.map((_, i) => <button key={i} type="button" className={`dot${i === current ? ' current' : ''}${answers[i] !== null ? ' done' : ''}`} onClick={() => setCurrent(i)} aria-label={`Go to question ${i + 1}`}>{i + 1}</button>)}
      </div>
      <div className="lesson-actions">
        <button type="button" className="btn btn-ghost" onClick={() => setCurrent((c) => c - 1)} disabled={current === 0}>Previous</button>
        {current < quiz.questions.length - 1
          ? <button type="button" className="btn btn-primary" onClick={() => setCurrent((c) => c + 1)}>Next</button>
          : <button type="button" className="btn btn-brand" onClick={() => submit(false)} disabled={submitting}>{submitting ? 'Submitting...' : 'Submit answers'}</button>}
      </div>
      {answered < quiz.questions.length && current === quiz.questions.length - 1 && <p className="field-hint">You have {quiz.questions.length - answered} unanswered question(s). Unanswered questions score zero.</p>}
    </div>
  );
}
