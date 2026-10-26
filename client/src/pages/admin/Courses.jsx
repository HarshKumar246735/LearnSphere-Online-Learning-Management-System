import { useState } from 'react';
import { Link } from 'react-router-dom';
import PageHeader from '../../components/dashboard/PageHeader.jsx';
import DataState from '../../components/dashboard/DataState.jsx';
import Pagination from '../../components/common/Pagination.jsx';
import useFetch from '../../hooks/useFetch.js';
import useDebounce from '../../hooks/useDebounce.js';
import { useToast } from '../../context/ToastContext.jsx';
import { getAdminCourses, setCourseStatus } from '../../services/adminService.js';

const badge = { published: 'badge-success', draft: 'badge-muted', suspended: 'badge-danger' };

export default function AdminCourses() {
  const toast = useToast();
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);
  const q = useDebounce(search);
  const { data, meta, loading, error, reload } = useFetch((s) => getAdminCourses({ page, limit: 15, search: q || undefined, status: status || undefined }, s), [page, q, status]);
  const change = async (c, next) => { try { await setCourseStatus(c._id, next); toast.success(`Course ${next}.`); reload(); } catch (e) { toast.error(e.message); } };
  return (
    <>
      <PageHeader title="Courses" subtitle="Review and moderate every course on the platform." />
      <div className="filters card"><div className="field"><label htmlFor="c-search">Search title</label><input id="c-search" className="input" value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} /></div>
        <div className="field"><label htmlFor="c-status">Status</label><select id="c-status" className="select" value={status} onChange={(e) => { setStatus(e.target.value); setPage(1); }}><option value="">All</option><option value="published">Published</option><option value="draft">Draft</option><option value="suspended">Suspended</option></select></div></div>
      <DataState loading={loading} error={error} onRetry={reload}>
        <div className="table-wrap"><table className="table">
          <thead><tr><th>Course</th><th>Instructor</th><th>Category</th><th>Lessons</th><th>Students</th><th>Status</th><th><span className="sr-only">Actions</span></th></tr></thead>
          <tbody>{data?.map((c) => (
            <tr key={c._id}><td>{c.status === 'published' ? <Link to={`/courses/${c.slug}`}><strong>{c.title}</strong></Link> : <strong>{c.title}</strong>}</td><td>{c.instructor?.name}</td><td>{c.category?.name}</td><td>{c.lessonsCount}</td><td>{c.enrollmentCount}</td>
              <td><span className={`badge ${badge[c.status]}`}>{c.status}</span></td>
              <td><div className="row-actions">{c.status !== 'suspended' && <button type="button" className="btn btn-ghost btn-sm" onClick={() => change(c, 'suspended')}>Suspend</button>}
                {c.status === 'suspended' && <button type="button" className="btn btn-ghost btn-sm" onClick={() => change(c, 'published')}>Restore</button>}</div></td></tr>
          ))}</tbody>
        </table></div>
        {data?.length === 0 && <p className="muted">No courses match.</p>}
        {meta && <Pagination page={meta.page} totalPages={meta.totalPages} onChange={setPage} />}
      </DataState>
    </>
  );
}
