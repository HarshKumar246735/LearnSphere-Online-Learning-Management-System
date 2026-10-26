import { useCallback, useEffect, useRef, useState } from 'react';
import { Flag, Send } from 'lucide-react';
import { useSocket, emitAsync } from '../../context/SocketContext.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import { useToast } from '../../context/ToastContext.jsx';
import { getDiscussion } from '../../services/socialService.js';
import { reportContent } from '../../services/learningService.js';
import { initials } from '../../utils/format.js';

export default function DiscussionPanel({ courseId }) {
  const { socket, connected } = useSocket();
  const { user } = useAuth();
  const toast = useToast();
  const [messages, setMessages] = useState([]);
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(true);
  const [text, setText] = useState('');
  const [sending, setSending] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => {
    let active = true;
    setLoading(true);
    getDiscussion(courseId, { limit: 30 })
      .then((res) => { if (active) { setMessages(res.data.data); setHasMore(res.data.meta.hasMore); } })
      .catch((e) => toast.error(e.message))
      .finally(() => active && setLoading(false));
    return () => { active = false; };
  }, [courseId, toast]);

  // Join the course room, listen for new posts, and leave (removing the listener) on unmount or reconnect.
  useEffect(() => {
    if (!socket || !connected) return undefined;
    const onNew = (m) => { if (String(m.course) === String(courseId)) setMessages((prev) => (prev.some((x) => x._id === m._id) ? prev : [...prev, m])); };
    socket.on('discussion:new', onNew);
    emitAsync(socket, 'discussion:join', { courseId }).catch((e) => toast.error(e.message));
    return () => { socket.off('discussion:new', onNew); socket.emit('discussion:leave', { courseId }); };
  }, [socket, connected, courseId, toast]);

  useEffect(() => { bottomRef.current?.scrollIntoView({ block: 'end' }); }, [messages.length]);

  const loadEarlier = useCallback(async () => {
    const res = await getDiscussion(courseId, { limit: 30, before: messages[0]?._id });
    setMessages((prev) => [...res.data.data, ...prev]);
    setHasMore(res.data.meta.hasMore);
  }, [courseId, messages]);

  const send = async (e) => {
    e.preventDefault();
    if (!text.trim() || sending) return;
    setSending(true);
    try { await emitAsync(socket, 'discussion:send', { courseId, text }); setText(''); } catch (err) { toast.error(err.message); } finally { setSending(false); }
  };

  const report = async (id) => {
    const reason = window.prompt('Why are you reporting this message?');
    if (!reason || reason.trim().length < 5) return;
    try { await reportContent({ targetType: 'discussion', targetId: id, reason }); toast.success('Thanks. A moderator will take a look.'); } catch (err) { toast.error(err.message); }
  };

  return (
    <div className="chat-panel">
      <div className="chat-scroll" aria-live="polite">
        {hasMore && <button type="button" className="btn btn-ghost btn-sm" onClick={loadEarlier}>Load earlier messages</button>}
        {loading && <p className="muted">Loading discussion...</p>}
        {!loading && messages.length === 0 && <p className="muted">No messages yet. Ask a question or share what you learned.</p>}
        {messages.map((m) => (
          <div key={m._id} className={`bubble-row${m.author?._id === user._id ? ' mine' : ''}`}>
            <span className="avatar">{initials(m.author?.name)}</span>
            <div className="bubble">
              <div className="bubble-head"><strong>{m.author?.name}</strong>{m.author?.role === 'instructor' && <span className="badge">Instructor</span>}
                <time dateTime={m.createdAt}>{new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</time></div>
              <p>{m.text}</p>
              {m.author?._id !== user._id && <button type="button" className="link-btn" onClick={() => report(m._id)}><Flag size={12} /> Report</button>}
            </div>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>
      <form className="chat-form" onSubmit={send}>
        <label className="sr-only" htmlFor="discussion-input">Message</label>
        <input id="discussion-input" className="input" value={text} onChange={(e) => setText(e.target.value)} maxLength={1500} placeholder={connected ? 'Write a message' : 'Reconnecting...'} disabled={!connected} />
        <button type="submit" className="btn btn-primary" disabled={!connected || sending || !text.trim()} aria-label="Send message"><Send size={16} /></button>
      </form>
    </div>
  );
}
