import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, CheckCheck } from 'lucide-react';
import PageHeader from '../../components/dashboard/PageHeader.jsx';
import StateBox from '../../components/common/StateBox.jsx';
import DataState from '../../components/dashboard/DataState.jsx';
import { useSocket } from '../../context/SocketContext.jsx';
import { useToast } from '../../context/ToastContext.jsx';
import { getNotifications, markNotificationRead, markAllNotificationsRead } from '../../services/socialService.js';
import { formatDate } from '../../utils/format.js';

export default function Notifications() {
  const { latestNotification, refreshCounts } = useSocket();
  const toast = useToast();
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [meta, setMeta] = useState(null);
  const [page, setPage] = useState(1);
  const [state, setState] = useState({ loading: true, error: '' });

  const load = useCallback(async (p) => {
    try {
      const res = await getNotifications({ page: p, limit: 15 });
      setItems((prev) => (p === 1 ? res.data.data : [...prev, ...res.data.data]));
      setMeta(res.data.meta);
      setState({ loading: false, error: '' });
    } catch (e) { setState({ loading: false, error: e.message }); }
  }, []);

  useEffect(() => { load(1); }, [load]);
  // A notification pushed over the socket appears at the top immediately.
  useEffect(() => { if (latestNotification) setItems((prev) => (prev.some((n) => n._id === latestNotification._id) ? prev : [latestNotification, ...prev])); }, [latestNotification]);

  const open = async (n) => {
    if (!n.readAt) {
      try { await markNotificationRead(n._id); setItems((p) => p.map((x) => (x._id === n._id ? { ...x, readAt: new Date().toISOString() } : x))); refreshCounts(); } catch (e) { toast.error(e.message); }
    }
    if (n.link) navigate(n.link);
  };
  const readAll = async () => { try { await markAllNotificationsRead(); setItems((p) => p.map((x) => ({ ...x, readAt: x.readAt || new Date().toISOString() }))); refreshCounts(); } catch (e) { toast.error(e.message); } };

  return (
    <>
      <PageHeader title="Notifications" subtitle={meta ? `${meta.unreadCount} unread` : ''} action={<button type="button" className="btn btn-ghost" onClick={readAll}><CheckCheck size={16} /> Mark all as read</button>} />
      <DataState loading={state.loading} error={state.error} onRetry={() => load(1)}>
        {items.length === 0 ? <StateBox icon={Bell} title="You are all caught up" message="New messages, announcements and course updates show up here." /> : (
          <>
            <ul className="notif-list">{items.map((n) => (
              <li key={n._id}>
                <button type="button" className={`notif${n.readAt ? '' : ' unread'}`} onClick={() => open(n)}>
                  <span className="notif-dot" aria-hidden="true" />
                  <span><strong>{n.title}</strong>{n.body && <small>{n.body}</small>}<time dateTime={n.createdAt}>{formatDate(n.createdAt)}</time></span>
                  {!n.readAt && <span className="sr-only">Unread</span>}
                </button>
              </li>
            ))}</ul>
            {meta && meta.page < meta.totalPages && <button type="button" className="btn btn-ghost" onClick={() => { setPage(page + 1); load(page + 1); }}>Load more</button>}
          </>
        )}
      </DataState>
    </>
  );
}
