import { TriangleAlert } from 'lucide-react';
import Skeleton from '../common/Skeleton.jsx';
import StateBox from '../common/StateBox.jsx';

// Standard loading / error wrapper for dashboard pages.
export default function DataState({ loading, error, onRetry, rows = 4, children }) {
  if (loading) {
    return <div className="stack" aria-busy="true">{Array.from({ length: rows }, (_, i) => <Skeleton key={i} height={64} radius="14px" />)}</div>;
  }
  if (error) {
    return <StateBox icon={TriangleAlert} title="We could not load this" message={error} action={onRetry && <button type="button" className="btn btn-primary" onClick={onRetry}>Try again</button>} />;
  }
  return children;
}
