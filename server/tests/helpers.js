import request from 'supertest';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';

export const AJAX = { 'X-Requested-With': 'XMLHttpRequest' };

// Boots an in-memory MongoDB and imports the app after the environment is prepared.
export async function bootstrap() {
  const mongod = await MongoMemoryServer.create();
  process.env.MONGODB_URI = mongod.getUri();
  process.env.JWT_SECRET = 'test-secret-'.padEnd(40, 'x');
  process.env.CLIENT_URL = 'http://localhost:5173';
  const { default: app } = await import('../src/app.js');
  await mongoose.connect(process.env.MONGODB_URI);
  const models = {
    User: (await import('../src/models/User.js')).default,
    Category: (await import('../src/models/Category.js')).default,
    Course: (await import('../src/models/Course.js')).default,
  };
  return { app, mongod, models };
}

export async function shutdown(mongod) {
  await mongoose.disconnect();
  await mongod.stop();
}

export const anonymous = (app) => request.agent(app).set(AJAX);

// Registers through the real endpoint (always a student), optionally promoting via the database like an admin would.
export async function signup(app, models, name, email, role = 'student') {
  const agent = request.agent(app).set(AJAX);
  const res = await agent.post('/api/v1/auth/register').send({ name, email, password: 'Passw0rd!', confirmPassword: 'Passw0rd!' });
  if (res.status !== 201) throw new Error(`signup failed: ${res.status} ${JSON.stringify(res.body)}`);
  if (role !== 'student') {
    await models.User.updateOne({ email }, { role });
  }
  return { agent, user: res.body.data.user, cookie: res.headers['set-cookie'].map((c) => c.split(';')[0]).join('; ') };
}
