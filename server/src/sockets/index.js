import { Server } from 'socket.io';
import User from '../models/User.js';
import Conversation from '../models/Conversation.js';
import { allowedOrigin } from '../config/cors.js';
import { tokenFromCookieHeader, verifyToken } from '../utils/token.js';
import { setIO, addSocket, removeSocket, emitToUser } from '../services/realtime.js';
import { registerChatHandlers } from './chatHandlers.js';
import { registerNotificationHandlers } from './notificationHandlers.js';
import { registerDiscussionHandlers } from './discussionHandlers.js';
import { registerStudyRoomHandlers } from './studyRoomHandlers.js';

async function broadcastPresence(userId, online) {
  const convs = await Conversation.find({ participants: userId }).select('participants').lean();
  convs.forEach((c) => c.participants.filter((p) => String(p) !== String(userId)).forEach((p) => emitToUser(p, 'presence', { userId: String(userId), online })));
}

export function initSockets(httpServer) {
  // CORS is pinned to the exact frontend origin, with credentials, because the session cookie must reach this server.
  const io = new Server(httpServer, { cors: { origin: allowedOrigin, credentials: true }, maxHttpBufferSize: 1e5 });
  setIO(io);

  // Same cookie-based identity as the REST API. Anything without a valid session is rejected at the handshake.
  io.use(async (socket, next) => {
    try {
      const token = tokenFromCookieHeader(socket.handshake.headers.cookie);
      if (!token) return next(new Error('Unauthorized'));
      const payload = verifyToken(token);
      const user = await User.findById(payload.sub);
      if (!user || !user.isActive) return next(new Error('Unauthorized'));
      socket.data.user = user;
      return next();
    } catch {
      return next(new Error('Unauthorized'));
    }
  });

  io.on('connection', (socket) => {
    const me = socket.data.user;
    socket.join(`user:${me._id}`);
    if (addSocket(me._id, socket.id)) broadcastPresence(me._id, true).catch(() => {});

    registerChatHandlers(socket);
    registerNotificationHandlers(socket);
    registerDiscussionHandlers(io, socket);
    registerStudyRoomHandlers(io, socket);

    socket.on('disconnect', () => {
      if (removeSocket(me._id, socket.id)) broadcastPresence(me._id, false).catch(() => {});
    });
  });

  return io;
}
