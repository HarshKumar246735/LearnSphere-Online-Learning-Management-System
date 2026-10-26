import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext.jsx';
import { getNotifications, getConversations } from '../services/socialService.js';

const SocketContext = createContext(null);

// One authenticated socket for the whole signed-in session. The cookie is sent automatically (withCredentials).
export function SocketProvider({ children }) {
  const { user } = useAuth();
  const [socket, setSocket] = useState(null);
  const [connected, setConnected] = useState(false);
  const [counts, setCounts] = useState({ notifications: 0, messages: 0 });
  const [latestNotification, setLatestNotification] = useState(null);
  const ref = useRef(null);
  const userId = user?._id; // depend on the id, not the object, so editing your profile does not reconnect the socket

  const refreshCounts = useCallback(async () => {
    try {
      const [n, c] = await Promise.all([getNotifications({ limit: 1 }), getConversations()]);
      setCounts({ notifications: n.data.meta.unreadCount, messages: c.data.data.reduce((a, x) => a + x.unread, 0) });
    } catch { /* counts are cosmetic; ignore failures */ }
  }, []);

  useEffect(() => {
    if (!userId) return undefined;
    const s = io(import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000', { withCredentials: true, transports: ['websocket', 'polling'] });
    ref.current = s;
    setSocket(s);
    const onConnect = () => { setConnected(true); refreshCounts(); }; // also re-syncs after a reconnect
    const onDisconnect = () => setConnected(false);
    const onNotification = (n) => { setLatestNotification(n); setCounts((c) => ({ ...c, notifications: c.notifications + 1 })); };
    const onMessage = (m) => { if (m.sender !== userId) setCounts((c) => ({ ...c, messages: c.messages + 1 })); };
    s.on('connect', onConnect);
    s.on('disconnect', onDisconnect);
    s.on('notification:new', onNotification);
    s.on('message:new', onMessage);
    return () => { // remove every listener and close, so nothing leaks across logins
      s.off('connect', onConnect); s.off('disconnect', onDisconnect); s.off('notification:new', onNotification); s.off('message:new', onMessage);
      s.close();
      ref.current = null; setSocket(null); setConnected(false); setCounts({ notifications: 0, messages: 0 });
    };
  }, [userId, refreshCounts]);

  const value = useMemo(() => ({ socket, connected, counts, latestNotification, refreshCounts, setCounts }), [socket, connected, counts, latestNotification, refreshCounts]);
  return <SocketContext.Provider value={value}>{children}</SocketContext.Provider>;
}

export const useSocket = () => useContext(SocketContext);

// Promise wrapper for acknowledged socket events.
export const emitAsync = (socket, event, payload) =>
  new Promise((resolve, reject) => {
    if (!socket?.connected) return reject(new Error('You are offline. Reconnecting...'));
    return socket.timeout(8000).emit(event, payload, (err, res) => {
      if (err) return reject(new Error('The server did not respond. Try again.'));
      return res?.ok ? resolve(res) : reject(new Error(res?.message || 'Request failed.'));
    });
  });
