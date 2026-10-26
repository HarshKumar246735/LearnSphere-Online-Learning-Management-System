import http from 'node:http';
import env from './config/env.js';
import { connectDB, disconnectDB } from './config/db.js';
import app from './app.js';
import { ensureDefaultCategories } from './services/categoryService.js';
import { initSockets } from './sockets/index.js';

const server = http.createServer(app);
const io = initSockets(server);

async function start() {
  await connectDB();
  await ensureDefaultCategories();
  server.listen(env.PORT, () => console.log(`LearnSphere API listening on port ${env.PORT} (${env.NODE_ENV})`));
}

let shuttingDown = false;
async function shutdown(signal) {
  if (shuttingDown) return;
  shuttingDown = true;
  console.log(`${signal} received, shutting down...`);
  const force = setTimeout(() => process.exit(1), 10000);
  force.unref();
  io.close();
  server.close(async () => {
    await disconnectDB();
    process.exit(0);
  });
}

['SIGTERM', 'SIGINT'].forEach((s) => process.on(s, () => shutdown(s)));
process.on('unhandledRejection', (reason) => {
  console.error('Unhandled rejection:', reason instanceof Error ? reason.message : reason);
});

start().catch((err) => {
  console.error('Failed to start server:', err.message);
  process.exit(1);
});
