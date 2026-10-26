import http from 'node:http';
import { jest } from '@jest/globals';
import { io as connect } from 'socket.io-client';
import { bootstrap, shutdown, signup } from './helpers.js';

let ctx; let server; let url; let teacher; let alice; let bob; let course; let conversationId;
const clients = [];

const open = (cookie) => new Promise((resolve, reject) => {
  const socket = connect(url, { transports: ['websocket'], extraHeaders: cookie ? { cookie } : {}, reconnection: false });
  clients.push(socket);
  socket.on('connect', () => resolve(socket));
  socket.on('connect_error', (err) => reject(err));
});
const emit = (socket, event, payload) => new Promise((resolve) => socket.emit(event, payload, resolve));

beforeAll(async () => {
  ctx = await bootstrap();
  const { initSockets } = await import('../src/sockets/index.js');
  server = http.createServer(ctx.app);
  initSockets(server);
  await new Promise((r) => server.listen(0, r));
  url = `http://localhost:${server.address().port}`;

  teacher = await signup(ctx.app, ctx.models, 'Terry Teacher', 'terry@example.com', 'instructor');
  alice = await signup(ctx.app, ctx.models, 'Alice Student', 'alice@example.com');
  bob = await signup(ctx.app, ctx.models, 'Bob Student', 'bob@example.com');
  const cat = await ctx.models.Category.create({ name: 'Programming', slug: 'programming' });
  course = (await teacher.agent.post('/api/v1/courses').send({ title: 'Realtime 101', description: 'Everything about live updates.', category: String(cat._id) })).body.data.course;
  await ctx.models.Course.updateOne({ _id: course._id }, { status: 'published', lessonsCount: 1 });
  await alice.agent.post(`/api/v1/courses/${course._id}/enroll`);
  conversationId = (await alice.agent.post('/api/v1/conversations').send({ userId: teacher.user._id })).body.data.conversationId;
});

afterAll(async () => {
  clients.forEach((c) => c.close());
  await new Promise((r) => server.close(r));
  await shutdown(ctx.mongod);
});

describe('socket authentication', () => {
  it('rejects connections without a session cookie', async () => {
    await expect(open(null)).rejects.toThrow('Unauthorized');
  });
  it('rejects a forged cookie', async () => {
    await expect(open('ls_token=not.a.jwt')).rejects.toThrow('Unauthorized');
  });
  it('accepts a valid session', async () => {
    const s = await open(alice.cookie);
    expect(s.connected).toBe(true);
  });
});

describe('discussion access', () => {
  it('lets enrolled students and the instructor join, and refuses others', async () => {
    const a = await open(alice.cookie);
    const t = await open(teacher.cookie);
    const b = await open(bob.cookie);
    expect((await emit(a, 'discussion:join', { courseId: String(course._id) })).ok).toBe(true);
    expect((await emit(t, 'discussion:join', { courseId: String(course._id) })).ok).toBe(true);
    expect((await emit(b, 'discussion:join', { courseId: String(course._id) })).ok).toBe(false);
    expect((await emit(b, 'discussion:send', { courseId: String(course._id), text: 'let me in' })).ok).toBe(false);
  });
  it('delivers posts in real time and stores them', async () => {
    const a = await open(alice.cookie);
    const t = await open(teacher.cookie);
    await emit(a, 'discussion:join', { courseId: String(course._id) });
    await emit(t, 'discussion:join', { courseId: String(course._id) });
    const received = new Promise((resolve) => t.once('discussion:new', resolve));
    await emit(a, 'discussion:send', { courseId: String(course._id), text: 'Hello from Alice' });
    expect((await received).author.name).toBe('Alice Student');
    const history = await alice.agent.get(`/api/v1/courses/${course._id}/discussions`);
    expect(history.body.data.at(-1).text).toBe('Hello from Alice');
  });
});

describe('private messaging', () => {
  it('delivers messages between the two participants only', async () => {
    const a = await open(alice.cookie);
    const t = await open(teacher.cookie);
    const b = await open(bob.cookie);
    const toTeacher = new Promise((resolve) => t.once('message:new', resolve));
    const bobHears = jest.fn();
    b.on('message:new', bobHears);
    const ack = await emit(a, 'message:send', { conversationId, text: 'Question about lesson 1', clientId: 'client-id-0001' });
    expect(ack.ok).toBe(true);
    expect((await toTeacher).text).toBe('Question about lesson 1');
    await new Promise((r) => setTimeout(r, 100));
    expect(bobHears).not.toHaveBeenCalled();
  });
  it('refuses to send into a conversation the user is not part of', async () => {
    const b = await open(bob.cookie);
    expect((await emit(b, 'message:send', { conversationId, text: 'sneaky message' })).ok).toBe(false);
  });
  it('treats a repeated clientId as a duplicate', async () => {
    const a = await open(alice.cookie);
    await emit(a, 'message:send', { conversationId, text: 'Retry me', clientId: 'client-id-0002' });
    await emit(a, 'message:send', { conversationId, text: 'Retry me', clientId: 'client-id-0002' });
    const msgs = await alice.agent.get(`/api/v1/conversations/${conversationId}/messages`);
    expect(msgs.body.data.filter((m) => m.text === 'Retry me')).toHaveLength(1);
  });
  it('only lets students message instructors of their own courses', async () => {
    const res = await bob.agent.post('/api/v1/conversations').send({ userId: teacher.user._id });
    expect(res.status).toBe(403);
  });
  it('rejects malformed payloads without crashing', async () => {
    const a = await open(alice.cookie);
    expect((await emit(a, 'message:send', { conversationId: 'nope', text: '' })).ok).toBe(false);
  });
});

describe('study rooms', () => {
  it('tracks presence and cleans up on disconnect', async () => {
    const room = (await alice.agent.post('/api/v1/study-rooms').send({ name: 'Exam prep' })).body.data.room;
    const a = await open(alice.cookie);
    const b = await open(bob.cookie);
    expect((await emit(a, 'room:join', { roomId: String(room._id) })).ok).toBe(true);
    const joined = await emit(b, 'room:join', { roomId: String(room._id) });
    expect(joined.participants).toHaveLength(2);
    const update = new Promise((resolve) => a.once('room:participants', resolve));
    b.close();
    expect((await update).participants).toHaveLength(1);
  });
  it('keeps course-linked rooms private to people with course access', async () => {
    const room = (await alice.agent.post('/api/v1/study-rooms').send({ name: 'Course room', courseId: String(course._id) })).body.data.room;
    const b = await open(bob.cookie);
    expect((await emit(b, 'room:join', { roomId: String(room._id) })).ok).toBe(false);
  });
});
