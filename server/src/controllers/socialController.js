import mongoose from 'mongoose';
import Notification from '../models/Notification.js';
import Conversation from '../models/Conversation.js';
import Message from '../models/Message.js';
import DiscussionMessage from '../models/DiscussionMessage.js';
import StudyRoom from '../models/StudyRoom.js';
import Course from '../models/Course.js';
import Enrollment from '../models/Enrollment.js';
import User from '../models/User.js';
import Report from '../models/Report.js';
import asyncHandler from '../utils/asyncHandler.js';
import AppError from '../utils/AppError.js';
import { ok, paginationMeta } from '../utils/response.js';
import { hasCourseAccess, loadOwnedCourse } from '../services/courseService.js';
import { notify } from '../services/notificationService.js';
import { emitToUser, isOnline, getIO } from '../services/realtime.js';
import { canMessage, pairKey } from '../services/chatService.js';

/* ---------- notifications ---------- */
export const listNotifications = asyncHandler(async (req, res) => {
  const { page, limit, unread } = req.query;
  const filter = { user: req.user._id, ...(unread === 'true' ? { readAt: null } : {}) };
  const [items, total, unreadCount] = await Promise.all([
    Notification.find(filter).sort('-createdAt').skip((page - 1) * limit).limit(limit).lean(),
    Notification.countDocuments(filter),
    Notification.countDocuments({ user: req.user._id, readAt: null }),
  ]);
  return ok(res, items, 200, { ...paginationMeta(page, limit, total), unreadCount });
});

export const markRead = asyncHandler(async (req, res) => {
  // Filtering by owner means one user can never touch another user's notification.
  const n = await Notification.findOneAndUpdate({ _id: req.params.id, user: req.user._id }, { readAt: new Date() }, { new: true });
  if (!n) throw new AppError('Notification not found.', 404);
  return ok(res, { notification: n });
});

export const markAllRead = asyncHandler(async (req, res) => {
  await Notification.updateMany({ user: req.user._id, readAt: null }, { readAt: new Date() });
  return ok(res, { updated: true });
});

export const announce = asyncHandler(async (req, res) => {
  const course = await loadOwnedCourse(req.params.courseId, req.user);
  const students = await Enrollment.find({ course: course._id }).distinct('student');
  await notify(students, { type: 'announcement', title: req.body.title, body: req.body.message, link: `/student/learn/${course.slug}` });
  return ok(res, { sentTo: students.length }, 201);
});

/* ---------- conversations ---------- */
export const listContacts = asyncHandler(async (req, res) => {
  let ids = [];
  if (req.user.role === 'student') {
    const courseIds = await Enrollment.find({ student: req.user._id }).distinct('course');
    ids = await Course.find({ _id: { $in: courseIds } }).distinct('instructor');
  } else if (req.user.role === 'instructor') {
    const courseIds = await Course.find({ instructor: req.user._id }).distinct('_id');
    ids = await Enrollment.find({ course: { $in: courseIds } }).distinct('student');
  }
  const users = await User.find({ _id: { $in: ids }, isActive: true }).select('name avatar role').limit(200).lean();
  return ok(res, users);
});

export const listConversations = asyncHandler(async (req, res) => {
  const convs = await Conversation.find({ participants: req.user._id }).sort({ 'lastMessage.at': -1 }).populate('participants', 'name avatar role').lean();
  const unread = await Message.aggregate([
    { $match: { conversation: { $in: convs.map((c) => c._id) }, sender: { $ne: req.user._id }, readAt: null } },
    { $group: { _id: '$conversation', n: { $sum: 1 } } },
  ]);
  const unreadMap = new Map(unread.map((u) => [String(u._id), u.n]));
  return ok(res, convs.map((c) => {
    const other = c.participants.find((p) => String(p._id) !== String(req.user._id));
    return { _id: c._id, other: other && { ...other, online: isOnline(other._id) }, lastMessage: c.lastMessage, unread: unreadMap.get(String(c._id)) || 0 };
  }));
});

export const startConversation = asyncHandler(async (req, res) => {
  const other = await User.findById(req.body.userId);
  if (!other || !other.isActive || String(other._id) === String(req.user._id)) throw new AppError('You cannot message that user.', 400);
  if (!(await canMessage(req.user, other))) throw new AppError('You can only message instructors of your courses or students enrolled in your courses.', 403);
  const conv = await Conversation.findOneAndUpdate(
    { pairKey: pairKey(req.user._id, other._id) },
    { $setOnInsert: { participants: [req.user._id, other._id], pairKey: pairKey(req.user._id, other._id) } },
    { upsert: true, new: true },
  );
  return ok(res, { conversationId: conv._id }, 201);
});

export const listMessages = asyncHandler(async (req, res) => {
  const conv = await Conversation.findOne({ _id: req.params.id, participants: req.user._id });
  if (!conv) throw new AppError('Conversation not found.', 404);
  const { before, limit } = req.query;
  const filter = { conversation: conv._id, ...(before ? { _id: { $lt: new mongoose.Types.ObjectId(before) } } : {}) };
  const items = await Message.find(filter).sort({ _id: -1 }).limit(limit).lean();
  const now = new Date();
  const res2 = await Message.updateMany({ conversation: conv._id, sender: { $ne: req.user._id }, readAt: null }, { readAt: now });
  if (res2.modifiedCount) {
    const otherId = conv.participants.find((p) => String(p) !== String(req.user._id));
    emitToUser(otherId, 'messages:read', { conversationId: conv._id, readAt: now });
  }
  return ok(res, items.reverse(), 200, { hasMore: items.length === limit });
});

/* ---------- course discussions ---------- */
export const listDiscussion = asyncHandler(async (req, res) => {
  const course = await Course.findById(req.params.courseId);
  if (!course) throw new AppError('Course not found.', 404);
  if (!(await hasCourseAccess(req.user, course))) throw new AppError('Enroll in this course to join its discussion.', 403);
  const { before, limit } = req.query;
  const filter = { course: course._id, isHidden: false, ...(before ? { _id: { $lt: new mongoose.Types.ObjectId(before) } } : {}) };
  const items = await DiscussionMessage.find(filter).sort({ _id: -1 }).limit(limit).populate('author', 'name avatar role').lean();
  return ok(res, items.reverse(), 200, { hasMore: items.length === limit });
});

/* ---------- study rooms ---------- */
export const listRooms = asyncHandler(async (req, res) => {
  const enrolled = await Enrollment.find({ student: req.user._id }).distinct('course');
  const owned = req.user.role === 'instructor' ? await Course.find({ instructor: req.user._id }).distinct('_id') : [];
  const filter = req.user.role === 'admin' ? {} : { $or: [{ course: { $exists: false } }, { course: null }, { course: { $in: [...enrolled, ...owned] } }] };
  const rooms = await StudyRoom.find(filter).sort('-createdAt').limit(50).populate('host', 'name').populate('course', 'title slug').lean();
  const io = getIO();
  return ok(res, rooms.map((r) => ({ ...r, participantCount: io?.sockets.adapter.rooms.get(`room:${r._id}`)?.size || 0 })));
});

export const createRoom = asyncHandler(async (req, res) => {
  const { name, description, courseId } = req.body;
  if (courseId) {
    const course = await Course.findById(courseId);
    if (!course || !(await hasCourseAccess(req.user, course))) throw new AppError('You do not have access to that course.', 403);
  }
  const room = await StudyRoom.create({ name, description, host: req.user._id, course: courseId });
  return ok(res, { room }, 201);
});

export const deleteRoom = asyncHandler(async (req, res) => {
  const room = await StudyRoom.findById(req.params.id);
  if (!room) throw new AppError('Room not found.', 404);
  if (String(room.host) !== String(req.user._id) && req.user.role !== 'admin') throw new AppError('Only the host can close this room.', 403);
  await room.deleteOne();
  getIO()?.to(`room:${room._id}`).emit('room:closed', { roomId: room._id });
  return ok(res, { deleted: true });
});

/* ---------- reports ---------- */
export const createReport = asyncHandler(async (req, res) => {
  try {
    const report = await Report.create({ ...req.body, reporter: req.user._id });
    return ok(res, { report }, 201);
  } catch (err) {
    if (err.code === 11000) throw new AppError('You have already reported this.', 409);
    throw err;
  }
});
