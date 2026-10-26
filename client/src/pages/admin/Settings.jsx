import { useEffect, useState } from 'react';
import PageHeader from '../../components/dashboard/PageHeader.jsx';
import DataState from '../../components/dashboard/DataState.jsx';
import useFetch from '../../hooks/useFetch.js';
import { useToast } from '../../context/ToastContext.jsx';
import { getAdminSettings, saveAdminSettings } from '../../services/adminService.js';

export default function AdminSettings() {
  const toast = useToast();
  const { data, loading, error, reload } = useFetch((s) => getAdminSettings(s), []);
  const [form, setForm] = useState({ allowRegistrations: true, announcement: '' });
  const [saving, setSaving] = useState(false);
  useEffect(() => { if (data) setForm({ allowRegistrations: data.settings.allowRegistrations, announcement: data.settings.announcement }); }, [data]);
  const save = async (e) => {
    e.preventDefault(); setSaving(true);
    try { await saveAdminSettings(form); toast.success('Settings saved.'); } catch (err) { toast.error(err.message); } finally { setSaving(false); }
  };
  return (
    <>
      <PageHeader title="Platform settings" />
      <DataState loading={loading} error={error} onRetry={reload} rows={2}>
        <form className="card pad stack narrow-card" onSubmit={save}>
          <label className="check"><input type="checkbox" checked={form.allowRegistrations} onChange={(e) => setForm({ ...form, allowRegistrations: e.target.checked })} /> Allow new registrations</label>
          <div className="field"><label htmlFor="announcement">Site-wide announcement banner</label><input id="announcement" className="input" maxLength={240} value={form.announcement} onChange={(e) => setForm({ ...form, announcement: e.target.value })} />
            <span className="field-hint">Shown at the top of public pages. Leave empty to hide it.</span></div>
          <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? 'Saving...' : 'Save settings'}</button>
        </form>
      </DataState>
    </>
  );
}
