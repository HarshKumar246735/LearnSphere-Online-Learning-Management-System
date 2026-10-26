import { z } from 'zod';
import { objectId, pagination } from './common.js';
import { parseYouTubeUrl } from '../utils/youtube.js';

export const idParam = z.object({ id: objectId });
export const courseIdParam = z.object({ courseId: objectId });
export const sectionIdParam = z.object({ sectionId: objectId });
export const lessonIdParam = z.object({ lessonId: objectId });
export const quizIdParam = z.object({ quizId: objectId });
export const reviewIdParam = z.object({ reviewId: objectId });

const password = z.string().min(8, 'Use at least 8 characters').max(72, 'Use 72 characters or fewer')
  .regex(/[A-Za-z]/, 'Include at least one letter').regex(/\d/, 'Include at least one number');
const email = z.string().trim().toLowerCase().email().max(254);

// Note: there is deliberately no "role" field. Zod strips unknown keys, so a client cannot choose its own role.
export const registerBody = z.object({
  name: z.string().trim().min(2).max(80),
  email,
  password,
  confirmPassword: z.string(),
}).refine((d) => d.password === d.confirmPassword, { path: ['confirmPassword'], message: 'Passwords do not match' });

export const loginBody = z.object({ email, password: z.string().min(1).max(200) });
export const forgotBody = z.object({ email });
export const resetBody = z.object({ token: z.string().regex(/^[a-f0-9]{64}$/), password, confirmPassword: z.string() })
  .refine((d) => d.password === d.confirmPassword, { path: ['confirmPassword'], message: 'Passwords do not match' });

const httpsUrlOrEmpty = z.union([z.literal(''), z.string().trim().url().max(500).refine((u) => /^https:\/\//i.test(u), 'Use an https:// link')]);

export const updateProfileBody = z.object({
  name: z.string().trim().min(2).max(80).optional(),
  headline: z.string().trim().max(120).optional(),
  bio: z.string().trim().max(1000).optional(),
  avatar: httpsUrlOrEmpty.optional(),
});
export const changePasswordBody = z.object({ currentPassword: z.string().min(1).max(200), newPassword: password, confirmPassword: z.string() })
  .refine((d) => d.newPassword === d.confirmPassword, { path: ['confirmPassword'], message: 'Passwords do not match' });

const stringList = z.array(z.string().trim().min(1).max(200)).max(10);
const courseFields = {
  title: z.string().trim().min(5).max(120),
  slug: z.string().trim().toLowerCase().regex(/^[a-z0-9]+(-[a-z0-9]+)*$/, 'Use lowercase letters, numbers and hyphens').min(3).max(120),
  shortDescription: z.string().trim().max(200),
  description: z.string().trim().min(20).max(5000),
  thumbnail: httpsUrlOrEmpty,
  category: objectId,
  level: z.enum(['beginner', 'intermediate', 'advanced']),
  learningObjectives: stringList,
  prerequisites: stringList,
  price: z.coerce.number().min(0).max(100000),
  language: z.string().trim().min(2).max(40),
};
export const createCourseBody = z.object({ ...courseFields, slug: courseFields.slug.optional(), shortDescription: courseFields.shortDescription.default(''),
  thumbnail: courseFields.thumbnail.default(''), level: courseFields.level.default('beginner'), learningObjectives: courseFields.learningObjectives.default([]),
  prerequisites: courseFields.prerequisites.default([]), price: courseFields.price.default(0), language: courseFields.language.default('English') });
export const updateCourseBody = z.object(courseFields).partial();
export const publishBody = z.object({ published: z.boolean() });

export const sectionBody = z.object({ title: z.string().trim().min(2).max(120) });
export const reorderBody = z.object({ ids: z.array(objectId).min(1).max(200) });
const youtubeUrl = z.string().trim().max(300).refine((u) => parseYouTubeUrl(u), 'Enter a valid YouTube link (watch, youtu.be, embed or shorts)');
const resources = z.array(z.object({ label: z.string().trim().min(1).max(80), url: z.string().trim().url().max(500).refine((u) => /^https?:\/\//i.test(u)) })).max(10);
const lessonFields = {
  title: z.string().trim().min(2).max(140),
  description: z.string().trim().max(3000),
  youtubeUrl,
  durationMinutes: z.coerce.number().int().min(0).max(1000),
  isPreview: z.boolean(),
  resources,
};
export const createLessonBody = z.object({ ...lessonFields, description: lessonFields.description.default(''), durationMinutes: lessonFields.durationMinutes.default(0),
  isPreview: lessonFields.isPreview.default(false), resources: lessonFields.resources.default([]) });
export const updateLessonBody = z.object(lessonFields).partial();

export const enrolledListQuery = pagination;

const question = z.object({
  prompt: z.string().trim().min(3).max(500),
  options: z.array(z.string().trim().min(1).max(200)).min(2).max(6),
  correctIndex: z.number().int().min(0),
  explanation: z.string().trim().max(500).default(''),
}).refine((q) => q.correctIndex < q.options.length, { path: ['correctIndex'], message: 'Correct answer must be one of the options' });
const quizFields = {
  lesson: objectId.nullable().optional(),
  title: z.string().trim().min(3).max(120),
  description: z.string().trim().max(500).default(''),
  questions: z.array(question).min(1).max(50),
  passingScore: z.coerce.number().int().min(1).max(100).default(70),
  timeLimitMinutes: z.coerce.number().int().min(0).max(240).default(0),
  maxAttempts: z.coerce.number().int().min(0).max(50).default(0),
  isRequired: z.boolean().default(true),
  showAnswers: z.boolean().default(true),
};
export const quizBody = z.object(quizFields);
export const updateQuizBody = z.object(quizFields).partial();
export const submitAttemptBody = z.object({ attemptId: objectId, answers: z.array(z.number().int().min(0).max(5).nullable()).max(50) });

export const reviewBody = z.object({ rating: z.number().int().min(1).max(5), comment: z.string().trim().max(1500).default('') });
export const reviewUpdateBody = reviewBody.partial();
export const reviewsQuery = pagination;

export const reportBody = z.object({ targetType: z.enum(['review', 'discussion', 'course']), targetId: objectId, reason: z.string().trim().min(5).max(500) });
export const announcementBody = z.object({ title: z.string().trim().min(3).max(140), message: z.string().trim().min(3).max(500) });
export const notificationsQuery = pagination.extend({ unread: z.enum(['true', 'false']).optional() });
export const conversationBody = z.object({ userId: objectId });
export const messagesQuery = z.object({ before: objectId.optional(), limit: z.coerce.number().int().min(1).max(50).default(30) });
export const studyRoomBody = z.object({ name: z.string().trim().min(3).max(60), description: z.string().trim().max(200).default(''), courseId: objectId.optional() });
export const testimonialBody = z.object({ quote: z.string().trim().min(20).max(400) });

export const adminUsersQuery = pagination.extend({ search: z.string().trim().max(80).optional(), role: z.enum(['student', 'instructor', 'admin']).optional() });
export const roleBody = z.object({ role: z.enum(['student', 'instructor', 'admin']) });
export const activeBody = z.object({ isActive: z.boolean() });
export const adminCoursesQuery = pagination.extend({ search: z.string().trim().max(80).optional(), status: z.enum(['draft', 'published', 'suspended']).optional() });
export const courseStatusBody = z.object({ status: z.enum(['draft', 'published', 'suspended']) });
export const categoryBody = z.object({ name: z.string().trim().min(2).max(60), description: z.string().trim().max(300).default(''), icon: z.string().trim().max(40).default('BookOpen'), order: z.coerce.number().int().min(0).default(0) });
export const reviewModerationBody = z.object({ isHidden: z.boolean() });
export const reportResolveBody = z.object({ status: z.enum(['resolved', 'dismissed']), hideTarget: z.boolean().default(false) });
export const reportsQuery = pagination.extend({ status: z.enum(['open', 'resolved', 'dismissed']).optional() });
export const settingsBody = z.object({ allowRegistrations: z.boolean().optional(), announcement: z.string().trim().max(240).optional() });
export const approveBody = z.object({ approved: z.boolean() });
