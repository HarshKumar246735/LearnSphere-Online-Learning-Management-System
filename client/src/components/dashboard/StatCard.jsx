export default function StatCard({ icon: Icon, label, value, tone = 'brand', hint }) {
  return (
    <div className={`stat-card tone-${tone}`}>
      {Icon && <span className="stat-card-icon"><Icon size={20} aria-hidden="true" /></span>}
      <div>
        <strong>{value}</strong>
        <span>{label}</span>
        {hint && <small>{hint}</small>}
      </div>
    </div>
  );
}
