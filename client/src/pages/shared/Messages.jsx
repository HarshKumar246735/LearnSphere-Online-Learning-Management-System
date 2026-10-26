import { useCallback, useEffect, useRef, useState } from 'react';
import { MessageSquare, Plus, Send } from 'lucide-react';
import PageHeader from '../../components/dashboard/PageHeader.jsx';
import StateBox from '../../components/common/StateBox.jsx';
import { useSocket, emitAsync } from '../../context/SocketContext.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import { useToast } from '../../context/ToastContext.jsx';
import { getConversations, getContacts, startConversation, getMessages } from '../../services/socialService.js';
import { initials } from '../../utils/format.js';

const uid = () => (crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(36).slice(2, 12)}`);

export default function Messages() {
  const { socket, connected, refreshCounts } = useSocket();
  const { user } = useAuth();
  const toast = useToast();
  const [convs, setConvs] = useState([]);
  const [contacts, setContacts] = useState([]);
  const [activeId, setActiveId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const endRef = useRef(null);
  const activeRef = useRef(null);
  activeRef.current = activeId;

  const loadConvs = useCallback(async () => {
    const [c, k] = await Promise.all([getConversations(), getContacts()]);
    setConvs(c.data.data);
    setContacts(k.data.data);
  }, []);

  useEffect(() => { loadConvs().catch((e) => toast.error(e.message)).finally(() => setLoading(false)); }, [loadConvs, toast]);

  const open = useCallback(async (id) => {
    setActiveId(id);
    setMessages([]);
    try {
      const res = await getMessages(id, { limit: 50 }); // the server marks incoming messages as read
      setMessages(res.data.data);
      setConvs((cs) => cs.map((c) => (c._id === id ? { ...c, unread: 0 } : c)));
      refreshCounts();
    } catch (e) { toast.error(e.message); }
  }, [refreshCounts, toast]);

  useEffect(() => {
    if (!socket) return undefined;
    const onMessage = (m) => {
      const isActive = String(m.conversation) === String(activeRef.current);
      if (isActive) {
        setMessages((prev) => (prev.some((x) => x._id === m._id) ? prev : [...prev, m]));
        if (m.sender !== user._id) emitAsync(socket, 'messages:read', { conversationId: m.conversation }).catch(() => {});
      }
      setConvs((cs) => {
        const exists = cs.some((c) => c._id === m.conversation);
        if (!exists) { loadConvs(); return cs; }
        return cs.map((c) => (c._id === m.conversation
          ? { ...c, lastMessage: { text: m.text, sender: m.sender, at: m.createdAt }, unread: isActive || m.sender === user._id ? 0 : c.unread + 1 } : c))
          .sort((a, b) => new Date(b.lastMessage?.at || 0) - new Date(a.lastMessage?.at || 0));
      });
    };
    const onPresence = ({ userId, online }) => setConvs((cs) => cs.map((c) => (c.other?._id === userId ? { ...c, other: { ...c.other, online } } : c)));
    const onRead = ({ conversationId, readAt }) => {
      if (String(conversationId) === String(activeRef.current)) setMessages((ms) => ms.map((m) => (m.sender === user._id && !m.readAt ? { ...m, readAt } : m)));
    };
    socket.on('message:new', onMessage); socket.on('presence', onPresence); socket.on('messages:read', onRead);
    return () => { socket.off('message:new', onMessage); socket.off('presence', onPresence); socket.off('messages:read', onRead); };
  }, [socket, user._id, loadConvs]);

  useEffect(() => { endRef.current?.scrollIntoView({ block: 'end' }); }, [messages.length]);

  const startWith = async (userId) => {
    if (!userId) return;
    try { const res = await startConversation(userId); await loadConvs(); open(res.data.data.conversationId); } catch (e) { toast.error(e.message); }
  };

  const send = async (e) => {
    e.preventDefault();
    if (!text.trim() || !activeId || sending) return;
    setSending(true);
    try {
      const res = await emitAsync(socket, 'message:send', { conversationId: activeId, text, clientId: uid() });
      setMessages((prev) => (prev.some((x) => x._id === res.message._id) ? prev : [...prev, res.message]));
      setText('');
    } catch (err) { toast.error(err.message); } finally { setSending(false); }
  };

  const active = convs.find((c) => c._id === activeId);
  const newContacts = contacts.filter((c) => !convs.some((v) => v.other?._id === c._id));

  return (
    <>
      <PageHeader title="Messages" subtitle={user.role === 'student' ? 'Talk to your instructors.' : 'Talk to your students.'} />
      <div className="messenger">
        <aside className="msg-list card">
          {newContacts.length > 0 && (
            <div className="msg-new">
              <label htmlFor="new-chat" className="sr-only">Start a conversation</label>
              <select id="new-chat" className="select" value="" onChange={(e) => startWith(e.target.value)}>
                <option value="">+ New conversation</option>
                {newContacts.map((c) => <option key={c._id} value={c._id}>{c.name}</option>)}
              </select>
            </div>
          )}
          {loading ? <p className="muted pad">Loading...</p> : convs.length === 0 ? <p className="muted pad">No conversations yet.{contacts.length === 0 ? (user.role === 'student' ? ' Enroll in a course to message its instructor.' : ' Students who enroll in your courses can be messaged here.') : ''}</p> : (
            <ul>{convs.map((c) => (
              <li key={c._id}>
                <button type="button" className={`msg-item${c._id === activeId ? ' active' : ''}`} onClick={() => open(c._id)}>
                  <span className="avatar">{initials(c.other?.name)}<i className={`dot-status${c.other?.online ? ' on' : ''}`} aria-hidden="true" /></span>
                  <span className="msg-meta"><strong>{c.other?.name}</strong><small>{c.lastMessage?.text || 'No messages yet'}</small></span>
                  {c.unread > 0 && <span className="count">{c.unread}</span>}
                </button>
              </li>
            ))}</ul>
          )}
        </aside>
        <section className="msg-thread card">
          {!active ? <StateBox icon={MessageSquare} title="Select a conversation" message="Choose someone on the left, or start a new conversation." /> : (
            <>
              <header className="thread-head"><span className="avatar">{initials(active.other?.name)}</span><div><strong>{active.other?.name}</strong><small>{active.other?.online ? 'Online' : 'Offline'}</small></div></header>
              <div className="chat-scroll" aria-live="polite">
                {messages.map((m) => (
                  <div key={m._id} className={`bubble-row${m.sender === user._id ? ' mine' : ''}`}>
                    <div className="bubble">
                      <p>{m.text}</p>
                      <div className="bubble-meta"><time dateTime={m.createdAt}>{new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</time>{m.sender === user._id && <span>{m.readAt ? 'Read' : 'Sent'}</span>}</div>
                    </div>
                  </div>
                ))}
                <div ref={endRef} />
              </div>
              <form className="chat-form" onSubmit={send}>
                <label className="sr-only" htmlFor="msg-input">Message</label>
                <input id="msg-input" className="input" value={text} maxLength={2000} onChange={(e) => setText(e.target.value)} placeholder={connected ? 'Type a message' : 'Reconnecting...'} disabled={!connected} />
                <button type="submit" className="btn btn-primary" disabled={!connected || sending || !text.trim()} aria-label="Send"><Send size={16} /></button>
              </form>
            </>
          )}
        </section>
      </div>
    </>
  );
}
