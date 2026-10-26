import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Award, Download, Copy } from 'lucide-react';
import PageHeader from '../../components/dashboard/PageHeader.jsx';
import DataState from '../../components/dashboard/DataState.jsx';
import StateBox from '../../components/common/StateBox.jsx';
import useFetch from '../../hooks/useFetch.js';
import { useToast } from '../../context/ToastContext.jsx';
import { getMyCertificates, downloadCertificate } from '../../services/learningService.js';
import { formatDate } from '../../utils/format.js';

export default function Certificates() {
  const toast = useToast();
  const { data, loading, error, reload } = useFetch((s) => getMyCertificates(s), []);
  const [busy, setBusy] = useState('');

  const download = async (id) => {
    setBusy(id);
    try {
      const res = await downloadCertificate(id);
      const url = URL.createObjectURL(res.data);
      const a = Object.assign(document.createElement('a'), { href: url, download: `${id}.pdf` });
      document.body.appendChild(a); a.click(); a.remove(); URL.revokeObjectURL(url);
    } catch (e) { toast.error(e.message); } finally { setBusy(''); }
  };
  const copy = async (url) => { try { await navigator.clipboard.writeText(url); toast.success('Verification link copied.'); } catch { toast.error('Could not copy. Select the link and copy it manually.'); } };

  return (
    <>
      <PageHeader title="My certificates" subtitle="Earned by completing every lesson and passing required quizzes." />
      <DataState loading={loading} error={error} onRetry={reload}>
        {data?.length === 0 ? <StateBox icon={Award} title="No certificates yet" message="Finish a course to earn your first one." action={<Link to="/student/courses" className="btn btn-primary">Continue learning</Link>} /> : (
          <div className="grid-2">{data?.map((c) => (
            <article key={c._id} className="cert-card">
              <Award size={28} aria-hidden="true" />
              <h3>{c.courseTitle}</h3>
              <p className="muted">Issued {formatDate(c.issuedAt)} · {c.instructorName}</p>
              <p className="cert-id">{c.certificateId}</p>
              <div className="lesson-actions">
                <button type="button" className="btn btn-primary btn-sm" onClick={() => download(c.certificateId)} disabled={busy === c.certificateId}><Download size={14} /> {busy === c.certificateId ? 'Preparing...' : 'Download PDF'}</button>
                <Link to={`/certificates/verify/${c.certificateId}`} className="btn btn-ghost btn-sm">Verification page</Link>
                <button type="button" className="btn btn-ghost btn-sm" onClick={() => copy(c.verificationUrl)}><Copy size={14} /> Copy link</button>
              </div>
            </article>
          ))}</div>
        )}
      </DataState>
    </>
  );
}
