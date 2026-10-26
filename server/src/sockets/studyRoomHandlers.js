import { z } from 'zod';
import StudyRoom from '../models/StudyRoom.js';
import Course from '../models/Course.js';
import AppError from '../utils/AppError.js';
import { objectId } from '../validators/common.js';
import { hasCourseAccess } from '../services/courseService.js';
import { safe } from './limiter.js';

const roomSchema = z.object({ roomId: objectId });
const messageSchema = z.object({ roomId: objectId, text: z.string().trim().min(1).max(500) });

// roomId -> Map(userId -> { name, sockets:Set }). Presence lives in memory by design: it describes who is connected
// right now. (Run a single server instance, or add the Socket.IO Redis adapter and move this map into Redis.)
const presence = new Map();

const participants = (roomId) => [...(presence.get(roomId) || new Map()).entries()].map(([id, p]) => ({ _id: id, name: p.name }));

function leave(io, socket, roomId) {
  const room = presence.get(roomId);
  const me = socket.data.user;
  socket.leave(`room:${roomId}`);
  if (!room) return;
  const entry = room.get(String(me._id));
  if (entry) {
    entry.sockets.delete(socket.id);
    if (!entry.sockets.size) room.delete(String(me._id));
  }
  if (!room.size) presence.delete(roomId);
  io.to(`room:${roomId}`).emit('room:participants', { roomId, participants: participants(roomId) });
}

export function registerStudyRoomHandlers(io, socket) {
  const me = socket.data.user;
  socket.data.rooms = new Set();

  socket.on('room:join', safe(socket, roomSchema, { key: 'join', max: 20, windowMs: 10000 }, async ({ roomId }) => {
    const room = await StudyRoom.findById(roomId);
    if (!room) throw new AppError('This study room no longer exists.', 404);
    if (room.course) {
      const course = await Course.findById(room.course);
      if (!course || !(await hasCourseAccess(me, course))) throw new AppError('This room is only for people enrolled in its course.', 403);
    }
    socket.join(`room:${roomId}`);
    socket.data.rooms.add(roomId);
    const map = presence.get(roomId) || new Map();
    const entry = map.get(String(me._id)) || { name: me.name, sockets: new Set() };
    entry.sockets.add(socket.id);
    map.set(String(me._id), entry);
    presence.set(roomId, map);
    io.to(`room:${roomId}`).emit('room:participants', { roomId, participants: participants(roomId) });
    return { room: { _id: room._id, name: room.name, description: room.description }, participants: participants(roomId) };
  }));

  socket.on('room:leave', safe(socket, roomSchema, null, async ({ roomId }) => {
    socket.data.rooms.delete(roomId);
    leave(io, socket, roomId);
    return {};
  }));

  socket.on('room:message', safe(socket, messageSchema, { key: 'room', max: 15, windowMs: 10000 }, async ({ roomId, text }) => {
    if (!socket.data.rooms.has(roomId)) throw new AppError('Join the room before sending messages.', 403);
    const message = { id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`, roomId, text, at: new Date().toISOString(), user: { _id: me._id, name: me.name } };
    io.to(`room:${roomId}`).emit('room:message', message);
    return {};
  }));

  // Clean up presence for every room this socket was in, so disconnected users never linger as participants.
  socket.on('disconnect', () => { [...socket.data.rooms].forEach((roomId) => leave(io, socket, roomId)); });
}
