const currency = import.meta.env.VITE_CURRENCY || 'USD';

export const formatPrice = (price) =>
  !price ? 'Free' : new Intl.NumberFormat(undefined, { style: 'currency', currency, maximumFractionDigits: 2 }).format(price);

export const formatDuration = (minutes = 0) => {
  if (!minutes) return 'Self-paced';
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (!h) return `${m} min`;
  return m ? `${h}h ${m}m` : `${h}h`;
};

export const levelLabel = (level) => (level ? level.charAt(0).toUpperCase() + level.slice(1) : '');

export const formatDate = (iso) =>
  iso ? new Date(iso).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' }) : '';

export const initials = (name = '') =>
  name.split(' ').filter(Boolean).map((p) => p[0]).slice(0, 2).join('').toUpperCase() || 'U';
