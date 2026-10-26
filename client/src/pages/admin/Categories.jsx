import { useState } from 'react';
import { Pencil, Trash2 } from 'lucide-react';
import PageHeader from '../../components/dashboard/PageHeader.jsx';
import DataState from '../../components/dashboard/DataState.jsx';
import ConfirmModal from '../../components/common/ConfirmModal.jsx';
import useFetch from '../../hooks/useFetch.js';
import { useToast } from '../../context/ToastContext.jsx';
import { getCategories } from '../../services/courseService.js';
import { createCategory, updateCategory, deleteCategory } from '../../services/adminService.js';

const ICONS = ['Globe', 'Code2', 'BarChart3', 'Brain', 'ShieldCheck', 'Database', 'Smartphone', 'Briefcase', 'BookOpen'];
const blank = { name: '', description: '', icon: 'BookOpen', order: 0 };

export default function AdminCategories() {
  const toast = useToast();
  const { data, loading, error, reload } = useFetch((s) => getCategories(s), []);
  const [form, setForm] = useState(blank);
  const [editing, setEditing] = useState(null);
  const [del, setDel] = useState(null);
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const save = async (e) => {
    e.preventDefault();
    try {
      const body = { ...form, order: Number(form.order) || 0 };
      if (editing) await updateCategory(editing, body); else await createCategory(body);
      toast.success('Category saved.'); setForm(blank); setEditing(null); reload();
    } catch (err) { toast.error(err.message); }
  };

  return (
    <>
      <PageHeader title="Categories" subtitle="Topics that organise the course catalogue." />
      <div className="grid-2">
        <DataState loading={loading} error={error} onRetry={reload}>
          <div className="table-wrap"><table className="table">
            <thead><tr><th>Name</th><th>Courses</th><th>Order</th><th><span className="sr-only">Actions</span></th></tr></thead>
            <tbody>{data?.map((c) => (
              <tr key={c._id}><td><strong>{c.name}</strong><br /><small className="muted">{c.description}</small></td><td>{c.courseCount}</td><td>{c.order}</td>
                <td><div className="row-actions"><button type="button" className="btn btn-ghost btn-sm" aria-label={`Edit ${c.name}`} onClick={() => { setEditing(c._id); setForm({ name: c.name, description: c.description, icon: c.icon, order: c.order }); }}><Pencil size={14} /></button>
                  <button type="button" className="btn btn-ghost btn-sm" aria-label={`Delete ${c.name}`} onClick={() => setDel(c)}><Trash2 size={14} /></button></div></td></tr>
            ))}</tbody>
          </table></div>
        </DataState>
        <form className="card pad stack" onSubmit={save}>
          <h2>{editing ? 'Edit category' : 'Add category'}</h2>
          <div className="field"><label htmlFor="cat-name">Name</label><input id="cat-name" className="input" required minLength={2} maxLength={60} value={form.name} onChange={set('name')} /></div>
          <div className="field"><label htmlFor="cat-desc">Description</label><input id="cat-desc" className="input" maxLength={300} value={form.description} onChange={set('description')} /></div>
          <div className="form-row"><div className="field"><label htmlFor="cat-icon">Icon</label><select id="cat-icon" className="select" value={form.icon} onChange={set('icon')}>{ICONS.map((i) => <option key={i}>{i}</option>)}</select></div>
            <div className="field"><label htmlFor="cat-order">Order</label><input id="cat-order" className="input" type="number" min="0" value={form.order} onChange={set('order')} /></div></div>
          <div className="lesson-actions"><button type="submit" className="btn btn-primary">{editing ? 'Save changes' : 'Add category'}</button>{editing && <button type="button" className="btn btn-ghost" onClick={() => { setEditing(null); setForm(blank); }}>Cancel</button>}</div>
        </form>
      </div>
      <ConfirmModal open={Boolean(del)} danger title="Delete category?" message={`"${del?.name}" will be removed. Categories that still contain courses cannot be deleted.`} confirmLabel="Delete"
        onCancel={() => setDel(null)} onConfirm={async () => { try { await deleteCategory(del._id); toast.success('Category deleted.'); reload(); } catch (e) { toast.error(e.message); } setDel(null); }} />
    </>
  );
}
