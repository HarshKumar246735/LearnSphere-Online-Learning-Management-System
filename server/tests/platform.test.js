import { bootstrap, shutdown, anonymous, signup } from './helpers.js';

const binary = (res, cb) => { const chunks = []; res.on('data', (c) => chunks.push(c)); res.on('end', () => cb(null, Buffer.concat(chunks))); };
let ctx; let teacher; let other; let alice; let bob; let admin; let course; let lesson; let quiz;
const V = 'https://youtu.be/dQw4w9WgXcQ';

beforeAll(async () => {
  ctx = await bootstrap();
  teacher = await signup(ctx.app, ctx.models, 'Terry Teacher', 'terry@example.com', 'instructor');
  other = await signup(ctx.app, ctx.models, 'Olive Other', 'olive@example.com', 'instructor');
  alice = await signup(ctx.app, ctx.models, 'Alice Student', 'alice@example.com');
  bob = await signup(ctx.app, ctx.models, 'Bob Student', 'bob@example.com');
  admin = await signup(ctx.app, ctx.models, 'Ada Admin', 'ada@example.com', 'admin');
  ctx.category = await ctx.models.Category.create({ name: 'Programming', slug: 'programming' });
});
afterAll(() => shutdown(ctx.mongod));

const courseBody = () => ({ title: 'Intro to Testing', description: 'A course about writing tests that actually matter.', category: String(ctx.category._id), price: 0 });

describe('role-based access and course ownership', () => {
  it('forbids students from creating courses', async () => {
    expect((await alice.agent.post('/api/v1/courses').send(courseBody())).status).toBe(403);
  });
  it('lets an instructor create a draft owned by them, ignoring a spoofed owner and status', async () => {
    const res = await teacher.agent.post('/api/v1/courses').send({ ...courseBody(), instructor: other.user._id, status: 'published' });
    expect(res.status).toBe(201);
    course = res.body.data.course;
    expect(course.status).toBe('draft');
    expect(String(course.instructor)).toBe(String(teacher.user._id));
  });
  it('blocks another instructor from editing, deleting or adding sections to it', async () => {
    expect((await other.agent.patch(`/api/v1/courses/${course._id}`).send({ title: 'Hijacked title' })).status).toBe(403);
    expect((await other.agent.delete(`/api/v1/courses/${course._id}`)).status).toBe(403);
    expect((await other.agent.post(`/api/v1/courses/${course._id}/sections`).send({ title: 'Evil section' })).status).toBe(403);
  });
  it('requires a login for management routes', async () => {
    expect((await anonymous(ctx.app).post('/api/v1/courses').send(courseBody())).status).toBe(401);
  });
  it('keeps admin routes admin-only', async () => {
    expect((await teacher.agent.get('/api/v1/admin/users')).status).toBe(403);
    expect((await admin.agent.get('/api/v1/admin/users')).status).toBe(200);
  });
});

describe('curriculum and publishing', () => {
  it('refuses to publish a course without lessons', async () => {
    expect((await teacher.agent.patch(`/api/v1/courses/${course._id}/publish`).send({ published: true })).status).toBe(400);
  });
  it('adds a section and a lesson, rejecting non-YouTube links', async () => {
    const sec = await teacher.agent.post(`/api/v1/courses/${course._id}/sections`).send({ title: 'Basics' });
    expect(sec.status).toBe(201);
    const bad = await teacher.agent.post(`/api/v1/sections/${sec.body.data.section._id}/lessons`).send({ title: 'Bad video', youtubeUrl: 'https://evil.example/watch?v=dQw4w9WgXcQ' });
    expect(bad.status).toBe(400);
    const good = await teacher.agent.post(`/api/v1/sections/${sec.body.data.section._id}/lessons`).send({ title: 'First lesson', youtubeUrl: V, durationMinutes: 12 });
    expect(good.status).toBe(201);
    expect(good.body.data.lesson.youtubeVideoId).toBe('dQw4w9WgXcQ');
    lesson = good.body.data.lesson;
    const fresh = await ctx.models.Course.findById(course._id);
    expect(fresh.lessonsCount).toBe(1);
    expect(fresh.durationMinutes).toBe(12);
  });
  it('publishes once it has a lesson', async () => {
    const res = await teacher.agent.patch(`/api/v1/courses/${course._id}/publish`).send({ published: true });
    expect(res.body.data.course.status).toBe('published');
  });
});

describe('enrollment and lesson access', () => {
  it('enrolls a student once and rejects duplicates and non-students', async () => {
    expect((await alice.agent.post(`/api/v1/courses/${course._id}/enroll`)).status).toBe(201);
    expect((await alice.agent.post(`/api/v1/courses/${course._id}/enroll`)).status).toBe(409);
    expect((await teacher.agent.post(`/api/v1/courses/${course._id}/enroll`)).status).toBe(403);
    expect((await ctx.models.Course.findById(course._id)).enrollmentCount).toBe(1);
  });
  it('hides lesson videos from people who are not enrolled', async () => {
    expect((await bob.agent.get(`/api/v1/courses/${course.slug}/learn`)).status).toBe(403);
    const ok = await alice.agent.get(`/api/v1/courses/${course.slug}/learn`);
    expect(ok.status).toBe(200);
    expect(ok.body.data.sections[0].lessons[0].youtubeVideoId).toBe('dQw4w9WgXcQ');
  });
  it('does not let non-enrolled students complete lessons', async () => {
    expect((await bob.agent.post(`/api/v1/lessons/${lesson._id}/complete`)).status).toBe(403);
  });
});

describe('quizzes, progress and certificates', () => {
  it('lets the instructor create a required quiz', async () => {
    const res = await teacher.agent.post(`/api/v1/courses/${course._id}/quizzes`).send({
      title: 'Testing basics', passingScore: 60,
      questions: [
        { prompt: 'What does a test prove?', options: ['Nothing', 'Behaviour', 'Colour'], correctIndex: 1, explanation: 'Tests describe behaviour.' },
        { prompt: 'Best time to write tests?', options: ['Early', 'Never'], correctIndex: 0 },
      ],
    });
    expect(res.status).toBe(201);
    quiz = res.body.data.quiz;
  });
  it('never sends correct answers to students before submission', async () => {
    const res = await alice.agent.get(`/api/v1/quizzes/${quiz._id}`);
    expect(JSON.stringify(res.body)).not.toMatch(/correctIndex|explanation/);
    const start = await alice.agent.post(`/api/v1/quizzes/${quiz._id}/start`);
    expect(JSON.stringify(start.body)).not.toMatch(/correctIndex|explanation/);
  });
  it('scores on the server and ignores a forged score', async () => {
    const start = await alice.agent.post(`/api/v1/quizzes/${quiz._id}/start`);
    const res = await alice.agent.post(`/api/v1/quizzes/${quiz._id}/attempts`).send({ attemptId: start.body.data.attemptId, answers: [0, 1], score: 100, passed: true });
    expect(res.status).toBe(200);
    expect(res.body.data.score).toBe(0);
    expect(res.body.data.passed).toBe(false);
  });
  it('rejects resubmitting the same attempt', async () => {
    const start = await alice.agent.post(`/api/v1/quizzes/${quiz._id}/start`);
    const payload = { attemptId: start.body.data.attemptId, answers: [1, 0] };
    expect((await alice.agent.post(`/api/v1/quizzes/${quiz._id}/attempts`).send(payload)).status).toBe(200);
    expect((await alice.agent.post(`/api/v1/quizzes/${quiz._id}/attempts`).send(payload)).status).toBe(409);
  });
  it('issues no certificate until every lesson is complete, then issues exactly one', async () => {
    expect((await alice.agent.get('/api/v1/certificates/me')).body.data).toHaveLength(0);
    const done = await alice.agent.post(`/api/v1/lessons/${lesson._id}/complete`);
    expect(done.status).toBe(200);
    expect(done.body.data.percent).toBe(100);
    expect(done.body.data.certificateId).toMatch(/^LS-[A-F0-9]{12}$/);
    await alice.agent.post(`/api/v1/lessons/${lesson._id}/complete`); // repeating is harmless
    expect((await alice.agent.get('/api/v1/certificates/me')).body.data).toHaveLength(1);
  });
  it('verifies certificates publicly and limits PDF downloads to the owner', async () => {
    const id = (await alice.agent.get('/api/v1/certificates/me')).body.data[0].certificateId;
    const pub = await anonymous(ctx.app).get(`/api/v1/certificates/verify/${id}`);
    expect(pub.body.data.valid).toBe(true);
    expect(pub.body.data.studentName).toBe('Alice Student');
    expect((await anonymous(ctx.app).get('/api/v1/certificates/verify/LS-000000000000')).body.data.valid).toBe(false);
    const pdf = await alice.agent.get(`/api/v1/certificates/${id}/pdf`).buffer(true).parse(binary);
    expect(pdf.status).toBe(200);
    expect(pdf.headers['content-type']).toMatch(/pdf/);
    expect(pdf.body.subarray(0, 4).toString()).toBe('%PDF');
    expect((await bob.agent.get(`/api/v1/certificates/${id}/pdf`)).status).toBe(403);
  });
});

describe('reviews', () => {
  it('only lets enrolled students review, once, and only authors edit', async () => {
    expect((await bob.agent.post(`/api/v1/courses/${course._id}/reviews`).send({ rating: 5 })).status).toBe(403);
    const created = await alice.agent.post(`/api/v1/courses/${course._id}/reviews`).send({ rating: 4, comment: 'Clear and practical.' });
    expect(created.status).toBe(201);
    expect((await alice.agent.post(`/api/v1/courses/${course._id}/reviews`).send({ rating: 5 })).status).toBe(409);
    const id = created.body.data.review._id;
    expect((await bob.agent.patch(`/api/v1/reviews/${id}`).send({ rating: 1 })).status).toBe(403);
    expect((await alice.agent.patch(`/api/v1/reviews/${id}`).send({ rating: 5 })).status).toBe(200);
    const fresh = await ctx.models.Course.findById(course._id);
    expect(fresh.ratingAvg).toBe(5);
    expect(fresh.ratingCount).toBe(1);
  });
});

describe('notifications', () => {
  it('shows people only their own notifications', async () => {
    const mine = await teacher.agent.get('/api/v1/notifications');
    expect(mine.body.data.length).toBeGreaterThan(0);
    const id = mine.body.data[0]._id;
    expect((await alice.agent.patch(`/api/v1/notifications/${id}/read`)).status).toBe(404);
    expect((await teacher.agent.patch(`/api/v1/notifications/${id}/read`)).status).toBe(200);
  });
  it('lets only the owner send course announcements', async () => {
    expect((await other.agent.post(`/api/v1/courses/${course._id}/announcements`).send({ title: 'Hello', message: 'Hi all' })).status).toBe(403);
    const ok = await teacher.agent.post(`/api/v1/courses/${course._id}/announcements`).send({ title: 'Welcome', message: 'Glad you joined.' });
    expect(ok.body.data.sentTo).toBe(1);
    expect((await bob.agent.get('/api/v1/notifications')).body.data.some((n) => n.title === 'Welcome')).toBe(false);
  });
});

describe('admin safeguards', () => {
  it('prevents admins from changing their own role', async () => {
    expect((await admin.agent.patch(`/api/v1/admin/users/${admin.user._id}/role`).send({ role: 'student' })).status).toBe(400);
  });
  it('lets an admin promote a user to instructor', async () => {
    const res = await admin.agent.patch(`/api/v1/admin/users/${bob.user._id}/role`).send({ role: 'instructor' });
    expect(res.body.data.user.role).toBe('instructor');
  });
});
