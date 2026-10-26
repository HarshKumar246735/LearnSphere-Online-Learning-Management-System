import { useState } from 'react';
import { X } from 'lucide-react';
import useFetch from '../../hooks/useFetch.js';
import { getPublicSettings } from '../../services/adminService.js';

export default function AnnouncementBanner() {
  const { data } = useFetch((s) => getPublicSettings(s), []);
  const [dismissed, setDismissed] = useState(false);
  if (!data?.announcement || dismissed) return null;
  return (
    <div className="announce" role="status">
      <span>{data.announcement}</span>
      <button type="button" onClick={() => setDismissed(true)} aria-label="Dismiss announcement"><X size={16} /></button>
    </div>
  );
}
