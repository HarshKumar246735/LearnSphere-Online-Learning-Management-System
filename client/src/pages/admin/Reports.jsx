import { useState } from 'react';
import PageHeader from '../../components/dashboard/PageHeader.jsx';
import DataState from '../../components/dashboard/DataState.jsx';
import StateBox from '../../components/common/StateBox.jsx';
import Pagination from '../../components/common/Pagination.jsx';
import useFetch from '../../hooks/useFetch.js';
import { useToast } from '../../context/ToastContext.jsx';
import { getReports, resolveReport } from '../../services/adminService.js';
import { formatDate } from '../../utils/format.js';

export default function AdminReports() {
  const toast = useToast();
  const [status, setStatus] = useState('open');
  const [page, setPage] = useState(1);
  const { data, meta, loading, error, reload } = useFetch((s) => getReports({ page, limit: 10, status: status || undefined }, s), [page, status]);
  const act = async (id, payload) => { try { await resolveReport(id, payload); toast.success('Report updated.'); reload(); } catch (e) { toast.error(e.message); } };
  return (
    <>
      <PageHeader title="Reported content" subtitle="Reviews, discussion messages and courses flagged by users." />
      <div className="filters card"><div className="field"><label htmlFor="r-status">Show</label><select id="r-status" className="select" value={status} onChange={(e) => { setStatus(e.target.value); setPage(1); }}><option value="open">Open</option><option value="resolved">Resolved</option><option value="dismissed">Dismissed</option><option value="">All</option></select></div></div>
      <DataState loading={loading} error={error} onRetry={reload}>
        {data?.length === 0 ? <StateBox title="Nothing to review" message="No reports match this filter." /> : (
          <div className="stack">{data?.map((r) => (
            <article key={r._id} className="card pad stack">
              <div className="row-between"><span className="badge">{r.targetType}</span><small className="muted">Reported by {r.reporter?.name} · {formatDate(r.createdAt)} · {r.status}</small></div>
              <blockquote className="quote-block">{r.preview}</blockquote>
              <p><strong>Reason:</strong> {r.reason}</p>
              {r.status === 'open' && <div className="lesson-actions">
                <button type="button" className="btn btn-danger btn-sm" onClick={() => act(r._id, { status: 'resolved', hideTarget: true })}>{r.targetType === 'course' ? 'Suspend course' : 'Hide content'} and resolve</button>
                <button type="button" className="btn btn-ghost btn-sm" onClick={() => act(r._id, { status: 'resolved' })}>Resolve without action</button>
                <button type="button" className="btn btn-ghost btn-sm" onClick={() => act(r._id, { status: 'dismissed' })}>Dismiss</button></div>}
            </article>
          ))}</div>
        )}
        {meta && <Pagination page={meta.page} totalPages={meta.totalPages} onChange={setPage} />}
      </DataState>
    </>
  );
}
