import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { BadgeCheck, ShieldX, Search } from 'lucide-react';
import useFetch from '../../hooks/useFetch.js';
import { verifyCertificate } from '../../services/learningService.js';
import { formatDate } from '../../utils/format.js';
import Skeleton from '../../components/common/Skeleton.jsx';
import StateBox from '../../components/common/StateBox.jsx';

function Result({ id }) {
  const { data, loading, error, reload } = useFetch((s) => verifyCertificate(id, s), [id]);
  if (loading) return <Skeleton height={180} radius="18px" />;
  if (error) return <StateBox title="Could not check this certificate" message={error} action={<button type="button" className="btn btn-primary" onClick={reload}>Try again</button>} />;
  if (!data.valid) return <div className="card verify-box invalid"><ShieldX size={36} /><h2>Certificate not found</h2><p>We have no certificate with ID <strong>{id}</strong>. Check the ID and try again.</p></div>;
  return (
    <div className="card verify-box valid">
      <BadgeCheck size={36} /><h2>Valid certificate</h2>
      <dl>
        <div><dt>Awarded to</dt><dd>{data.studentName}</dd></div>
        <div><dt>Course</dt><dd>{data.courseTitle}</dd></div>
        <div><dt>Instructor</dt><dd>{data.instructorName}</dd></div>
        <div><dt>Issued</dt><dd>{formatDate(data.issuedAt)}</dd></div>
        <div><dt>Certificate ID</dt><dd>{data.certificateId}</dd></div>
      </dl>
    </div>
  );
}

export default function CertificateVerify() {
  const { certificateId } = useParams();
  const navigate = useNavigate();
  const [value, setValue] = useState(certificateId && certificateId !== 'check' ? certificateId : '');
  const showResult = certificateId && certificateId !== 'check';
  return (
    <section className="container page-section narrow">
      <div className="page-head"><div><h1>Verify a certificate</h1><p>Enter the certificate ID printed on the certificate.</p></div></div>
      <form className="verify-form" onSubmit={(e) => { e.preventDefault(); if (value.trim()) navigate(`/certificates/verify/${encodeURIComponent(value.trim())}`); }}>
        <label className="sr-only" htmlFor="cert-id">Certificate ID</label>
        <div className="input-icon"><Search size={18} /><input id="cert-id" className="input" placeholder="LS-XXXXXXXXXXXX" value={value} onChange={(e) => setValue(e.target.value)} /></div>
        <button type="submit" className="btn btn-primary">Verify</button>
      </form>
      {showResult && <div style={{ marginTop: '1.5rem' }}><Result id={certificateId} /></div>}
    </section>
  );
}
