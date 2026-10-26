import { z } from 'zod';
import Course from '../models/Course.js';
import DiscussionMessage from '../models/DiscussionMessage.js';
import AppError from '../utils/AppError.js';
import { objectId } from '../validators/common.js';
import { hasCourseAccess } from '../services/courseService.js';
import { safe } from './limiter.js';

const joinSchema = z.object({ courseId: objectId });
const sendSchema = z.object({ courseId: objectId, text: z.string().trim().min(1).max(1500) });

async function requireAccess(user, courseId) {
  const course = await Course.findById(courseId);
  if (!course || !(await hasCourseAccess(user, course))) throw new AppError('You do not have access to this discussion.', 403);
  return course;
}

export function registerDiscussionHandlers(io, socket) {
  const me = socket.data.user;

  socket.on('discussion:join', safe(socket, joinSchema, { key: 'join', max: 20, windowMs: 10000 }, async ({ courseId }) => {
    await requireAccess(me, courseId);
    socket.join(`course:${courseId}`);
    return {};
  }));

  socket.on('discussion:leave', safe(socket, joinSchema, null, async ({ courseId }) => { socket.leave(`course:${courseId}`); return {}; }));

  socket.on('discussion:send', safe(socket, sendSchema, { key: 'discussion', max: 12, windowMs: 10000 }, async ({ courseId, text }) => {
    await requireAccess(me, courseId); // checked on every send, so removing access takes effect immediately
    const doc = await DiscussionMessage.create({ course: courseId, author: me._id, text });
    const message = { _id: doc._id, course: courseId, text: doc.text, createdAt: doc.createdAt, author: { _id: me._id, name: me.name, avatar: me.avatar, role: me.role } };
    io.to(`course:${courseId}`).emit('discussion:new', message);
    return { message };
  }));
}
