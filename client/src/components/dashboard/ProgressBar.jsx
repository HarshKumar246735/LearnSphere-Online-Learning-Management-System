export default function ProgressBar({ percent = 0, label }) {
  return (
    <div className="progress" role="progressbar" aria-valuenow={percent} aria-valuemin={0} aria-valuemax={100} aria-label={label || 'Progress'}>
      <span style={{ width: `${percent}%` }} />
    </div>
  );
}
