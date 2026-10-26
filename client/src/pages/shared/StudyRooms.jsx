import { useCallback, useEffect, useRef, useState } from 'react';
import { Users, Send, LogOut, Trash2 } from 'lucide-react';
import PageHeader from '../../components/dashboard/PageHeader.jsx';
import DataState from '../../components/dashboard/DataState.jsx';
import StateBox from '../../components/common/StateBox.jsx';
import useFetch from '../../hooks/useFetch.js';
import { useSocket, emitAsync } from '../../context/SocketContext.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import { useToast } from '../../context/ToastContext.jsx';
import { getStudyRooms, createStudyRoom, deleteStudyRoom } from '../../services/socialService.js';

function Room({ room, onLeave }) {
  const { socket, connected } = useSocket();
  const { user } = useAuth();
  const toast = useToast();
  const [people, setPeople] = useState([]);
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');
  const endRef = useRef(null);

  useEffect(() => {
    if (!socket || !connected) return undefined;
    const onPeople = (p) => { if (p.roomId === room._id) setPeople(p.participants); };
    const onMsg = (m) => { if (m.roomId === room._id) setMessages((prev) => [...prev, m]); };
    const onClosed = (c) => { if (c.roomId === room._id) { toast.error('The host closed this room.'); onLeave(); } };
    socket.on('room:participants', onPeople); socket.on('room:message', onMsg); socket.on('room:closed', onClosed);
    emitAsync(socket, 'room:join', { roomId: room._id }).then((r) => setPeople(r.participants)).catch((e) => { toast.error(e.message); onLeave(); });
    return () => { // leave the room and drop all listeners so nothing lingers
      socket.off('room:participants', onPeople); socket.off('room:message', onMsg); socket.off('room:closed', onClosed);
      socket.emit('room:leave', { roomId: room._id });
    };
  }, [socket, connected, room._id, toast, onLeave]);

  useEffect(() => { endRef.current?.scrollIntoView({ block: 'end' }); }, [messages.length]);

  const send = async (e) => {
    e.preventDefault();
    if (!text.trim()) return;
    try { await emitAsync(socket, 'room:message', { roomId: room._id, text }); setText(''); } catch (err) { toast.error(err.message); }
  };

  return (
    <div className="room card">
      <header className="thread-head"><div><strong>{room.name}</strong><small>{room.description}</small></div>
        <button type="button" className="btn btn-ghost btn-sm" onClick={onLeave}><LogOut size={14} /> Leave</button></header>
      <div className="room-body">
        <div className="chat-panel">
          <div className="chat-scroll" aria-live="polite">
            {messages.length === 0 && <p className="muted">Room messages are not saved. They disappear when everyone leaves.</p>}
            {messages.map((m) => (
              <div key={m.id} className={`bubble-row${m.user._id === user._id ? ' mine' : ''}`}><div className="bubble"><div className="bubble-head"><strong>{m.user.name}</strong></div><p>{m.text}</p></div></div>
            ))}
            <div ref={endRef} />
          </div>
          <form className="chat-form" onSubmit={send}>
            <label className="sr-only" htmlFor="room-input">Message</label>
            <input id="room-input" className="input" value={text} maxLength={500} onChange={(e) => setText(e.target.value)} placeholder="Message the room" />
            <button type="submit" className="btn btn-primary" disabled={!text.trim()} aria-label="Send"><Send size={16} /></button>
          </form>
        </div>
        <aside className="room-people"><h3><Users size={16} /> In this room ({people.length})</h3>
          <ul>{people.map((p) => <li key={p._id}><i className="dot-status on" /> {p.name}{p._id === user._id ? ' (you)' : ''}</li>)}</ul></aside>
      </div>
    </div>
  );
}

export default function StudyRooms() {
  const { user } = useAuth();
  const toast = useToast();
  const { data, loading, error, reload } = useFetch((s) => getStudyRooms(s), []);
  const [joined, setJoined] = useState(null);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const leave = useCallback(() => { setJoined(null); reload(); }, [reload]);

  const create = async (e) => {
    e.preventDefault();
    try { const res = await createStudyRoom({ name, description }); setName(''); setDescription(''); await reload(); setJoined(res.data.data.room); }
    catch (err) { toast.error(err.message); }
  };
  const close = async (id) => { try { await deleteStudyRoom(id); reload(); } catch (err) { toast.error(err.message); } };

  if (joined) return <><PageHeader title="Live study room" /><Room room={joined} onLeave={leave} /></>;
  return (
    <>
      <PageHeader title="Live study rooms" subtitle="Join a room to study together and chat in real time. Text chat only, no video." />
      <div className="grid-2">
        <section className="stack">
          <DataState loading={loading} error={error} onRetry={reload}>
            {data?.length === 0 ? <StateBox icon={Users} title="No rooms yet" message="Create the first one." /> : data?.map((r) => (
              <article key={r._id} className="card pad row-between">
                <div><strong>{r.name}</strong><p className="muted">{r.description || 'Open study session'} · hosted by {r.host?.name}{r.course ? ` · ${r.course.title}` : ''}</p><small>{r.participantCount} here now</small></div>
                <div className="lesson-actions">
                  <button type="button" className="btn btn-primary btn-sm" onClick={() => setJoined(r)}>Join</button>
                  {(r.host?._id === user._id || user.role === 'admin') && <button type="button" className="btn btn-ghost btn-sm" onClick={() => close(r._id)} aria-label={`Close ${r.name}`}><Trash2 size={14} /></button>}
                </div>
              </article>
            ))}
          </DataState>
        </section>
        <form className="card pad stack" onSubmit={create}>
          <h2>Create a room</h2>
          <div className="field"><label htmlFor="room-name">Room name</label><input id="room-name" className="input" value={name} onChange={(e) => setName(e.target.value)} minLength={3} maxLength={60} required /></div>
          <div className="field"><label htmlFor="room-desc">Description (optional)</label><input id="room-desc" className="input" value={description} onChange={(e) => setDescription(e.target.value)} maxLength={200} /></div>
          <button type="submit" className="btn btn-primary" disabled={name.trim().length < 3}>Create and join</button>
        </form>
      </div>
    </>
  );
}
