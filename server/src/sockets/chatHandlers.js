import { z } from 'zod';
import Message from '../models/Message.js';
import Conversation from '../models/Conversation.js';
import { objectId } from '../validators/common.js';
import { sendMessage } from '../services/chatService.js';
import { emitToUser } from '../services/realtime.js';
import { safe } from './limiter.js';

const sendSchema = z.object({ conversationId: objectId, text: z.string().trim().min(1).max(2000), clientId: z.string().min(8).max(64).optional() });
const readSchema = z.object({ conversationId: objectId });

export function registerChatHandlers(socket) {
  const me = socket.data.user; // identity comes from the verified cookie, never from the payload

  socket.on('message:send', safe(socket, sendSchema, { key: 'message', max: 20, windowMs: 10000 }, async ({ conversationId, text, clientId }) => {
    const { message } = await sendMessage({ sender: me, conversationId, text, clientId });
    return { message };
  }));

  socket.on('messages:read', safe(socket, readSchema, { key: 'read', max: 60, windowMs: 10000 }, async ({ conversationId }) => {
    const conv = await Conversation.findOne({ _id: conversationId, participants: me._id });
    if (!conv) return { updated: 0 };
    const readAt = new Date();
    const r = await Message.updateMany({ conversation: conv._id, sender: { $ne: me._id }, readAt: null }, { readAt });
    const other = conv.participants.find((p) => String(p) !== String(me._id));
    if (r.modifiedCount) emitToUser(other, 'messages:read', { conversationId: conv._id, readAt });
    return { updated: r.modifiedCount };
  }));
}
