import Notification from '../models/Notification.js';
import { emitToUser } from './realtime.js';

// Persist first (so offline users still get it), then push over Socket.IO.
export async function notify(userIds, { type, title, body = '', link = '' }) {
  const ids = [...new Set(userIds.map(String))];
  if (!ids.length) return [];
  const docs = await Notification.insertMany(ids.map((user) => ({ user, type, title, body, link })));
  docs.forEach((d) => emitToUser(d.user, 'notification:new', d.toObject()));
  return docs;
}
