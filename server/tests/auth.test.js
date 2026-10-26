import request from 'supertest';
import { bootstrap, shutdown, AJAX, anonymous, signup } from './helpers.js';

let ctx;
beforeAll(async () => { ctx = await bootstrap(); });
afterAll(() => shutdown(ctx.mongod));

const body = { name: 'Nora Learner', email: 'nora@example.com', password: 'Passw0rd!', confirmPassword: 'Passw0rd!' };

describe('registration', () => {
  it('creates a student, sets an HTTP-only cookie and never returns the password', async () => {
    const res = await anonymous(ctx.app).post('/api/v1/auth/register').send(body);
    expect(res.status).toBe(201);
    expect(res.body.data.user.password).toBeUndefined();
    expect(res.body.data.user.role).toBe('student');
    expect(res.headers['set-cookie'][0]).toMatch(/HttpOnly/i);
  });

  it('ignores a role supplied by the client (no self-promotion)', async () => {
    const res = await anonymous(ctx.app).post('/api/v1/auth/register').send({ ...body, email: 'sneaky@example.com', role: 'admin' });
    expect(res.status).toBe(201);
    expect(res.body.data.user.role).toBe('student');
  });

  it('stores a hashed password', async () => {
    const user = await ctx.models.User.findOne({ email: body.email }).select('+password');
    expect(user.password).not.toBe(body.password);
    expect(user.password).toMatch(/^\$2[aby]\$/);
  });

  it('rejects duplicate emails and weak passwords', async () => {
    expect((await anonymous(ctx.app).post('/api/v1/auth/register').send(body)).status).toBe(409);
    const weak = await anonymous(ctx.app).post('/api/v1/auth/register').send({ ...body, email: 'weak@example.com', password: 'short', confirmPassword: 'short' });
    expect(weak.status).toBe(400);
  });
});

describe('login and session', () => {
  it('logs in with valid credentials and returns the user from /auth/me', async () => {
    const agent = anonymous(ctx.app);
    expect((await agent.post('/api/v1/auth/login').send({ email: body.email, password: body.password })).status).toBe(200);
    const me = await agent.get('/api/v1/auth/me');
    expect(me.body.data.user.email).toBe(body.email);
  });

  it('gives the same error for a wrong password and an unknown email', async () => {
    const a = await anonymous(ctx.app).post('/api/v1/auth/login').send({ email: body.email, password: 'WrongPass1' });
    const b = await anonymous(ctx.app).post('/api/v1/auth/login').send({ email: 'nobody@example.com', password: 'WrongPass1' });
    expect(a.status).toBe(401);
    expect(b.status).toBe(401);
    expect(a.body.message).toBe(b.body.message);
  });

  it('requires a session for /auth/me and clears it on logout', async () => {
    expect((await anonymous(ctx.app).get('/api/v1/auth/me')).status).toBe(401);
    const { agent } = await signup(ctx.app, ctx.models, 'Lou Out', 'lou@example.com');
    await agent.post('/api/v1/auth/logout');
    expect((await agent.get('/api/v1/auth/me')).status).toBe(401);
  });

  it('blocks deactivated accounts', async () => {
    await signup(ctx.app, ctx.models, 'Dee Active', 'dee@example.com');
    await ctx.models.User.updateOne({ email: 'dee@example.com' }, { isActive: false });
    const res = await anonymous(ctx.app).post('/api/v1/auth/login').send({ email: 'dee@example.com', password: 'Passw0rd!' });
    expect(res.status).toBe(403);
  });
});

describe('CSRF protection', () => {
  it('rejects state-changing requests that lack the custom header', async () => {
    const res = await request(ctx.app).post('/api/v1/auth/logout');
    expect(res.status).toBe(403);
  });
  it('rejects requests from a different origin', async () => {
    const res = await request(ctx.app).post('/api/v1/auth/logout').set(AJAX).set('Origin', 'https://evil.example');
    expect(res.status).toBe(403);
  });
});

describe('password reset', () => {
  it('answers identically for known and unknown emails', async () => {
    const known = await anonymous(ctx.app).post('/api/v1/auth/forgot-password').send({ email: body.email });
    const unknown = await anonymous(ctx.app).post('/api/v1/auth/forgot-password').send({ email: 'ghost@example.com' });
    expect(known.status).toBe(200);
    expect(known.body).toEqual(unknown.body);
  });

  it('resets once with a valid token and never stores the raw token', async () => {
    const { sentMail } = await import('../src/services/mailService.js');
    sentMail.length = 0;
    await anonymous(ctx.app).post('/api/v1/auth/forgot-password').send({ email: body.email });
    const token = sentMail[0].text.match(/token=([a-f0-9]{64})/)[1];
    const stored = await ctx.models.User.findOne({ email: body.email }).select('+passwordResetTokenHash');
    expect(stored.passwordResetTokenHash).not.toBe(token);

    const reset = await anonymous(ctx.app).post('/api/v1/auth/reset-password').send({ token, password: 'NewPassw0rd!', confirmPassword: 'NewPassw0rd!' });
    expect(reset.status).toBe(200);
    const again = await anonymous(ctx.app).post('/api/v1/auth/reset-password').send({ token, password: 'Another1Pass', confirmPassword: 'Another1Pass' });
    expect(again.status).toBe(400);
    expect((await anonymous(ctx.app).post('/api/v1/auth/login').send({ email: body.email, password: 'NewPassw0rd!' })).status).toBe(200);
  });

  it('rejects an expired token', async () => {
    const { sentMail } = await import('../src/services/mailService.js');
    sentMail.length = 0;
    await anonymous(ctx.app).post('/api/v1/auth/forgot-password').send({ email: body.email });
    const token = sentMail[0].text.match(/token=([a-f0-9]{64})/)[1];
    await ctx.models.User.updateOne({ email: body.email }, { passwordResetExpires: new Date(Date.now() - 1000) });
    const res = await anonymous(ctx.app).post('/api/v1/auth/reset-password').send({ token, password: 'LatePassw0rd', confirmPassword: 'LatePassw0rd' });
    expect(res.status).toBe(400);
  });
});
