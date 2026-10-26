import { z } from 'zod';
import Notification from '../models/Notification.js';
import { objectId } from '../validators/common.js';
import { safe } from './limiter.js';

export function registerNotificationHandlers(socket) {
  const me = socket.data.user;
  socket.on('notification:read', safe(socket, z.object({ id: objectId }), { key: 'notif', max: 60, windowMs: 10000 }, async ({ id }) => {
    await Notification.updateOne({ _id: id, user: me._id }, { readAt: new Date() }); // owner filter: cannot touch other people's
    return { unreadCount: await Notification.countDocuments({ user: me._id, readAt: null }) };
  }));
}
