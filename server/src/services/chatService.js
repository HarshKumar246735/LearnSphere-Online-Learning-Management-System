import Conversation from '../models/Conversation.js';
import Message from '../models/Message.js';
import Course from '../models/Course.js';
import Enrollment from '../models/Enrollment.js';
import User from '../models/User.js';
import AppError from '../utils/AppError.js';
import { notify } from './notificationService.js';
import { emitToUser, isOnline } from './realtime.js';

export const pairKey = (a, b) => [String(a), String(b)].sort().join(':');

// Students may message instructors of courses they are enrolled in, and instructors may message their enrolled students.
export async function canMessage(a, b) {
  const [student, instructor] = a.role === 'student' && b.role === 'instructor' ? [a, b] : a.role === 'instructor' && b.role === 'student' ? [b, a] : [];
  if (!student) return false;
  const courseIds = await Course.find({ instructor: instructor._id }).distinct('_id');
  return Boolean(await Enrollment.exists({ student: student._id, course: { $in: courseIds } }));
}

export async function sendMessage({ sender, conversationId, text, clientId }) {
  const conv = await Conversation.findOne({ _id: conversationId, participants: sender._id });
  if (!conv) throw new AppError('Conversation not found.', 404);
  const recipientId = conv.participants.find((p) => String(p) !== String(sender._id));

  let message;
  try {
    message = await Message.create({ conversation: conv._id, sender: sender._id, text, clientId });
  } catch (err) {
    if (err.code === 11000 && clientId) { // a retry after reconnecting: return the original instead of duplicating it
      return { message: await Message.findOne({ sender: sender._id, clientId }).lean(), duplicate: true };
    }
    throw err;
  }
  conv.lastMessage = { text: text.slice(0, 120), sender: sender._id, at: message.createdAt };
  await conv.save();

  const payload = message.toObject();
  emitToUser(recipientId, 'message:new', payload);
  emitToUser(sender._id, 'message:new', payload); // keeps the sender's other tabs in sync
  if (!isOnline(recipientId)) {
    const recipient = await User.findById(recipientId).select('role').lean();
    await notify([recipientId], { type: 'message', title: `New message from ${sender.name}`, body: text.slice(0, 120), link: `/${recipient?.role || 'student'}/messages` });
  }
  return { message: payload, duplicate: false };
}
