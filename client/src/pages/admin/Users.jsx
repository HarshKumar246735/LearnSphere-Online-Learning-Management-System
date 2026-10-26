import { useState } from 'react';
import PageHeader from '../../components/dashboard/PageHeader.jsx';
import DataState from '../../components/dashboard/DataState.jsx';
import Pagination from '../../components/common/Pagination.jsx';
import ConfirmModal from '../../components/common/ConfirmModal.jsx';
import useFetch from '../../hooks/useFetch.js';
import useDebounce from '../../hooks/useDebounce.js';
import { useAuth } from '../../context/AuthContext.jsx';
import { useToast } from '../../context/ToastContext.jsx';
import { getAdminUsers, setUserRole, setUserActive } from '../../services/adminService.js';
import { formatDate } from '../../utils/format.js';

export default function AdminUsers() {
  const { user: me } = useAuth();
  const toast = useToast();
  const [search, setSearch] = useState('');
  const [role, setRole] = useState('');
  const [page, setPage] = useState(1);
  const q = useDebounce(search);
  const { data, meta, loading, error, reload } = useFetch((s) => getAdminUsers({ page, limit: 15, search: q || undefined, role: role || undefined }, s), [page, q, role]);
  const [pending, setPending] = useState(null);

  const apply = async () => {
    try {
      if (pending.kind === 'role') await setUserRole(pending.user._id, pending.value); else await setUserActive(pending.user._id, pending.value);
      toast.success('User updated.'); reload();
    } catch (e) { toast.error(e.message); }
    setPending(null);
  };

  return (
    <>
      <PageHeader title="Users" subtitle="Promote instructors, deactivate accounts." />
      <div className="filters card"><div className="field"><label htmlFor="u-search">Search name or email</label><input id="u-search" className="input" value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} /></div>
        <div className="field"><label htmlFor="u-role">Role</label><select id="u-role" className="select" value={role} onChange={(e) => { setRole(e.target.value); setPage(1); }}><option value="">All roles</option><option value="student">Student</option><option value="instructor">Instructor</option><option value="admin">Admin</option></select></div></div>
      <DataState loading={loading} error={error} onRetry={reload}>
        <div className="table-wrap"><table className="table">
          <thead><tr><th>User</th><th>Role</th><th>Joined</th><th>Status</th><th><span className="sr-only">Actions</span></th></tr></thead>
          <tbody>{data?.map((u) => (
            <tr key={u._id}><td><strong>{u.name}</strong><br /><small className="muted">{u.email}</small></td>
              <td><label className="sr-only" htmlFor={`role-${u._id}`}>Role for {u.name}</label>
                <select id={`role-${u._id}`} className="select select-sm" value={u.role} disabled={u._id === me._id} onChange={(e) => setPending({ kind: 'role', user: u, value: e.target.value })}><option value="student">student</option><option value="instructor">instructor</option><option value="admin">admin</option></select></td>
              <td>{formatDate(u.createdAt)}</td><td><span className={`badge ${u.isActive ? 'badge-success' : 'badge-danger'}`}>{u.isActive ? 'Active' : 'Deactivated'}</span></td>
              <td>{u._id !== me._id && <button type="button" className="btn btn-ghost btn-sm" onClick={() => setPending({ kind: 'active', user: u, value: !u.isActive })}>{u.isActive ? 'Deactivate' : 'Reactivate'}</button>}</td></tr>
          ))}</tbody>
        </table></div>
        {data?.length === 0 && <p className="muted">No users match.</p>}
        {meta && <Pagination page={meta.page} totalPages={meta.totalPages} onChange={setPage} />}
      </DataState>
      <ConfirmModal open={Boolean(pending)} danger={pending?.kind === 'active' && pending.value === false} title={pending?.kind === 'role' ? 'Change role?' : pending?.value ? 'Reactivate account?' : 'Deactivate account?'}
        message={pending ? (pending.kind === 'role' ? `${pending.user.name} will become ${pending.value === 'admin' ? 'an' : 'a'} ${pending.value}.` : pending.value ? `${pending.user.name} will be able to log in again.` : `${pending.user.name} will be signed out and unable to log in.`) : ''}
        confirmLabel="Confirm" onConfirm={apply} onCancel={() => setPending(null)} />
    </>
  );
}
