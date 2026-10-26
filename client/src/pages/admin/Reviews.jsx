import { useState } from 'react';
import PageHeader from '../../components/dashboard/PageHeader.jsx';
import DataState from '../../components/dashboard/DataState.jsx';
import Pagination from '../../components/common/Pagination.jsx';
import useFetch from '../../hooks/useFetch.js';
import { useToast } from '../../context/ToastContext.jsx';
import { getAdminReviews, moderateReview, getAdminTestimonials, approveTestimonial, deleteTestimonial } from '../../services/adminService.js';
import { formatDate } from '../../utils/format.js';

export default function AdminReviews() {
  const toast = useToast();
  const [page, setPage] = useState(1);
  const reviews = useFetch((s) => getAdminReviews({ page, limit: 15 }, s), [page]);
  const testimonials = useFetch((s) => getAdminTestimonials(s), []);
  const act = async (fn, reload, msg) => { try { await fn(); toast.success(msg); reload(); } catch (e) { toast.error(e.message); } };
  return (
    <>
      <PageHeader title="Reviews and testimonials" subtitle="Hide inappropriate reviews and approve genuine testimonials for the home page." />
      <section className="stack-lg">
        <div><h2>Course reviews</h2>
          <DataState loading={reviews.loading} error={reviews.error} onRetry={reviews.reload}>
            {reviews.data?.length === 0 ? <p className="muted">No reviews yet.</p> : (
              <><div className="table-wrap"><table className="table">
                <thead><tr><th>Student</th><th>Course</th><th>Rating</th><th>Comment</th><th>Date</th><th><span className="sr-only">Actions</span></th></tr></thead>
                <tbody>{reviews.data?.map((r) => (
                  <tr key={r._id}><td>{r.student?.name}</td><td>{r.course?.title}</td><td>{r.rating}/5</td><td className="wrap">{r.comment || <em className="muted">No comment</em>}</td><td>{formatDate(r.createdAt)}</td>
                    <td><button type="button" className="btn btn-ghost btn-sm" onClick={() => act(() => moderateReview(r._id, !r.isHidden), reviews.reload, r.isHidden ? 'Review restored.' : 'Review hidden.')}>{r.isHidden ? 'Restore' : 'Hide'}</button></td></tr>
                ))}</tbody></table></div>
                {reviews.meta && <Pagination page={reviews.meta.page} totalPages={reviews.meta.totalPages} onChange={setPage} />}</>
            )}
          </DataState></div>
        <div><h2>Testimonials</h2>
          <DataState loading={testimonials.loading} error={testimonials.error} onRetry={testimonials.reload}>
            {testimonials.data?.length === 0 ? <p className="muted">Nobody has submitted a testimonial yet.</p> : (
              <div className="stack">{testimonials.data?.map((t) => (
                <article key={t._id} className="card pad row-between"><div><p>“{t.quote}”</p><small className="muted">{t.user?.name} ({t.user?.role}) · {t.approved ? 'Showing on the home page' : 'Awaiting approval'}</small></div>
                  <div className="row-actions"><button type="button" className="btn btn-ghost btn-sm" onClick={() => act(() => approveTestimonial(t._id, !t.approved), testimonials.reload, t.approved ? 'Testimonial hidden.' : 'Testimonial approved.')}>{t.approved ? 'Hide' : 'Approve'}</button>
                    <button type="button" className="btn btn-ghost btn-sm" onClick={() => act(() => deleteTestimonial(t._id), testimonials.reload, 'Testimonial deleted.')}>Delete</button></div></article>
              ))}</div>
            )}
          </DataState></div>
      </section>
    </>
  );
}
