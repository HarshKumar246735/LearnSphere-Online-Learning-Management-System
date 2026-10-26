import { useCallback, useEffect, useState } from 'react';
import axios from 'axios';

// Runs `fetcher(signal)` (which must return an axios response) whenever `deps` change.
// Returns { data, meta, loading, error, status, reload }. Stale and aborted requests are ignored.
export default function useFetch(fetcher, deps = []) {
  const [state, setState] = useState({ data: null, meta: null, loading: true, error: null, status: null });
  const [tick, setTick] = useState(0);
  const reload = useCallback(() => setTick((t) => t + 1), []);

  useEffect(() => {
    const controller = new AbortController();
    setState((s) => ({ ...s, loading: true, error: null }));
    fetcher(controller.signal)
      .then((res) => setState({ data: res.data.data, meta: res.data.meta || null, loading: false, error: null, status: null }))
      .catch((err) => {
        if (axios.isCancel(err)) return;
        setState({ data: null, meta: null, loading: false, error: err.message, status: err.status || null });
      });
    return () => controller.abort();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...deps, tick]);

  return { ...state, reload };
}
