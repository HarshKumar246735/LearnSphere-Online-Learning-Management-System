import { useState } from 'react';
import PageHeader from '../../components/dashboard/PageHeader.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import { useToast } from '../../context/ToastContext.jsx';
import { updateProfile, submitTestimonial } from '../../services/socialService.js';

export default function Profile() {
  const { user, setUser } = useAuth();
  const toast = useToast();
  const [form, setForm] = useState({ name: user.name, headline: user.headline || '', bio: user.bio || '', avatar: user.avatar || '' });
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});
  const [quote, setQuote] = useState('');
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const save = async (e) => {
    e.preventDefault();
    setSaving(true); setErrors({});
    try { const res = await updateProfile(form); setUser(res.data.data.user); toast.success('Profile saved.'); }
    catch (err) { setErrors(Object.fromEntries((err.details || []).map((d) => [d.field, d.message]))); toast.error(err.message); }
    finally { setSaving(false); }
  };
  const sendQuote = async (e) => {
    e.preventDefault();
    try { const res = await submitTestimonial(quote); toast.success(res.data.data.message); setQuote(''); } catch (err) { toast.error(err.message); }
  };

  const field = (id, label, extra = {}) => (
    <div className="field"><label htmlFor={id}>{label}</label>
      <input id={id} className="input" value={form[id]} onChange={set(id)} aria-invalid={errors[id] ? 'true' : 'false'} {...extra} />
      {errors[id] && <span className="field-error" role="alert">{errors[id]}</span>}</div>
  );

  return (
    <>
      <PageHeader title="Profile" subtitle={`${user.email} · ${user.role}`} />
      <div className="grid-2">
        <form className="card pad stack" onSubmit={save}>
          <h2>Your details</h2>
          {field('name', 'Full name')}
          {field('headline', 'Headline', { placeholder: 'For example: Frontend developer', maxLength: 120 })}
          {field('avatar', 'Profile photo link (https)', { placeholder: 'https://...' })}
          <div className="field"><label htmlFor="bio">About you</label><textarea id="bio" className="textarea" rows={4} maxLength={1000} value={form.bio} onChange={set('bio')} /></div>
          <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? 'Saving...' : 'Save changes'}</button>
        </form>
        {user.role !== 'admin' && (
          <form className="card pad stack" onSubmit={sendQuote}>
            <h2>Share your experience</h2>
            <p className="muted">Tell others what learning on LearnSphere is like. After a moderator approves it, it may appear on the home page with your name.</p>
            <div className="field"><label htmlFor="quote">Your testimonial</label><textarea id="quote" className="textarea" rows={4} minLength={20} maxLength={400} value={quote} onChange={(e) => setQuote(e.target.value)} /></div>
            <button type="submit" className="btn btn-ghost" disabled={quote.trim().length < 20}>Submit for review</button>
          </form>
        )}
      </div>
    </>
  );
}
