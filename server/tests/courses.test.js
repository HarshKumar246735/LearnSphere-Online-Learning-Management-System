import request from 'supertest';
import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';

let app;
let mongod;
let M;

beforeAll(async () => {
  mongod = await MongoMemoryServer.create();
  process.env.MONGODB_URI = mongod.getUri();
  process.env.JWT_SECRET = 'x'.repeat(40);
  process.env.CLIENT_URL = 'http://localhost:5173';
  ({ default: app } = await import('../src/app.js'));
  M = {
    User: (await import('../src/models/User.js')).default,
    Category: (await import('../src/models/Category.js')).default,
    Course: (await import('../src/models/Course.js')).default,
    Section: (await import('../src/models/Section.js')).default,
    Lesson: (await import('../src/models/Lesson.js')).default,
  };
  await mongoose.connect(process.env.MONGODB_URI);

  const teacher = await M.User.create({ name: 'Ada Teacher', email: 'ada@example.com', password: 'password123', role: 'instructor' });
  const web = await M.Category.create({ name: 'Web Development', slug: 'web-development' });
  const ai = await M.Category.create({ name: 'Artificial Intelligence', slug: 'artificial-intelligence' });
  const base = { description: 'A thorough course description.', instructor: teacher._id };
  const react = await M.Course.create({ ...base, title: 'React for Beginners', slug: 'react-for-beginners', category: web._id, status: 'published', price: 0, enrollmentCount: 5 });
  await M.Course.create({ ...base, title: 'Advanced Machine Learning', slug: 'advanced-ml', category: ai._id, status: 'published', level: 'advanced', price: 49 });
  await M.Course.create({ ...base, title: 'Secret Draft Course', slug: 'secret-draft', category: web._id, status: 'draft' });
  const section = await M.Section.create({ course: react._id, title: 'Getting started', order: 0 });
  await M.Lesson.create({ course: react._id, section: section._id, title: 'Free intro', order: 0, isPreview: true, youtubeVideoId: 'dQw4w9WgXcQ' });
  await M.Lesson.create({ course: react._id, section: section._id, title: 'Paid lesson', order: 1, isPreview: false, youtubeVideoId: 'aqz-KE-bpKQ' });
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongod.stop();
});

describe('public course discovery', () => {
  it('lists only published courses', async () => {
    const res = await request(app).get('/api/v1/courses');
    expect(res.status).toBe(200);
    expect(res.body.data.map((c) => c.slug).sort()).toEqual(['advanced-ml', 'react-for-beginners']);
    expect(res.body.meta.total).toBe(2);
  });

  it('searches by title and by instructor name', async () => {
    const byTitle = await request(app).get('/api/v1/courses?search=react');
    expect(byTitle.body.data).toHaveLength(1);
    const byInstructor = await request(app).get('/api/v1/courses?search=ada');
    expect(byInstructor.body.data).toHaveLength(2);
  });

  it('treats search input as text, not as a regular expression', async () => {
    const res = await request(app).get('/api/v1/courses').query({ search: '.*' });
    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(0);
  });

  it('filters by category, level and free', async () => {
    expect((await request(app).get('/api/v1/courses?category=web-development')).body.data).toHaveLength(1);
    expect((await request(app).get('/api/v1/courses?level=advanced')).body.data).toHaveLength(1);
    expect((await request(app).get('/api/v1/courses?free=true')).body.data[0].slug).toBe('react-for-beginners');
  });

  it('paginates and rejects bad query values', async () => {
    const page = await request(app).get('/api/v1/courses?limit=1&page=2');
    expect(page.body.data).toHaveLength(1);
    expect(page.body.meta.totalPages).toBe(2);
    expect((await request(app).get('/api/v1/courses?limit=500')).status).toBe(400);
  });

  it('hides draft courses from the detail endpoint', async () => {
    expect((await request(app).get('/api/v1/courses/secret-draft')).status).toBe(404);
  });

  it('exposes video ids only for preview lessons', async () => {
    const res = await request(app).get('/api/v1/courses/react-for-beginners');
    const lessons = res.body.data.sections[0].lessons;
    expect(lessons.find((l) => l.title === 'Free intro').youtubeVideoId).toBe('dQw4w9WgXcQ');
    expect(lessons.find((l) => l.title === 'Paid lesson').youtubeVideoId).toBeUndefined();
  });

  it('reports real platform statistics', async () => {
    const res = await request(app).get('/api/v1/stats');
    expect(res.body.data).toEqual({ courses: 2, students: 0, instructors: 1, completedCourses: 0 });
  });

  it('accepts a valid contact message and rejects an invalid one', async () => {
    const good = await request(app).post('/api/v1/contact').set('X-Requested-With', 'XMLHttpRequest').send({ name: 'Sam', email: 'sam@example.com', subject: 'Hello', message: 'I have a question about courses.' });
    expect(good.status).toBe(201);
    expect((await request(app).post('/api/v1/contact').set('X-Requested-With', 'XMLHttpRequest').send({ name: 'S', email: 'nope', subject: '', message: 'x' })).status).toBe(400);
  });
});
