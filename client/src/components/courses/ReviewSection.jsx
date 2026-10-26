import { useEffect, useState } from 'react';
import { Star } from 'lucide-react';
import { useAuth } from '../../context/AuthContext.jsx';
import { useToast } from '../../context/ToastContext.jsx';
import { getMyReview, saveReview, updateReview, deleteReview } from '../../services/learningService.js';

// Shown to signed-in students. The server decides who is eligible (enrolled students only).
export default function ReviewSection({ courseId, onChanged }) {
  const { user } = useAuth();
  const toast = useToast();
  const [state, setState] = useState(null);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (user?.role !== 'student') return;
    getMyReview(courseId).then((res) => { const d = res.data.data; setState(d); if (d.review) { setRating(d.review.rating); setComment(d.review.comment); } }).catch(() => setState({ canReview: false }));
  }, [courseId, user]);

  if (user?.role !== 'student' || !state?.canReview) return null;
  const existing = state.review;

  const submit = async (e) => {
    e.preventDefault(); setBusy(true);
    try {
      const res = existing ? await updateReview(existing._id, { rating, comment }) : await saveReview(courseId, { rating, comment });
      setState({ ...state, review: res.data.data.review }); toast.success(existing ? 'Review updated.' : 'Thanks for your review!'); onChanged?.();
    } catch (err) { toast.error(err.message); } finally { setBusy(false); }
  };
  const remove = async () => {
    try { await deleteReview(existing._id); setState({ ...state, review: null }); setComment(''); setRating(5); toast.success('Review deleted.'); onChanged?.(); } catch (err) { toast.error(err.message); }
  };

  return (
    <form className="review-form" onSubmit={submit}>
      <h3>{existing ? 'Your review' : 'Rate this course'}</h3>
      <div className="star-input" role="radiogroup" aria-label="Rating">
        {[1, 2, 3, 4, 5].map((n) => (
          <button key={n} type="button" role="radio" aria-checked={rating === n} aria-label={`${n} star${n > 1 ? 's' : ''}`} className={n <= rating ? 'on' : ''} onClick={() => setRating(n)}><Star size={22} fill={n <= rating ? 'currentColor' : 'none'} /></button>
        ))}
      </div>
      <label className="sr-only" htmlFor="review-comment">Your review</label>
      <textarea id="review-comment" className="textarea" rows={3} maxLength={1500} value={comment} onChange={(e) => setComment(e.target.value)} placeholder="What did you think? (optional)" />
      <div className="lesson-actions"><button type="submit" className="btn btn-primary btn-sm" disabled={busy}>{existing ? 'Update review' : 'Post review'}</button>{existing && <button type="button" className="btn btn-ghost btn-sm" onClick={remove}>Delete</button>}</div>
    </form>
  );
}
