import { Router } from 'express';
import validate from '../middleware/validate.js';
import { authenticate, authorize } from '../middleware/authenticate.js';
import { pagination } from '../validators/common.js';
import * as S from '../validators/schemas.js';
import { listCoursesQuery, slugParam } from '../validators/course.js';
import { z } from 'zod';

import authRoutes from './auth.js';
import publicRoutes from './public.js';
import { listCourses, featuredCourses, getCourseBySlug } from '../controllers/courseController.js';
import * as user from '../controllers/userController.js';
import * as manage from '../controllers/courseManageController.js';
import * as cur from '../controllers/curriculumController.js';
import * as learn from '../controllers/learningController.js';
import * as quiz from '../controllers/quizController.js';
import * as cert from '../controllers/certificateController.js';
import * as review from '../controllers/reviewController.js';
import * as social from '../controllers/socialController.js';
import * as dash from '../controllers/dashboardController.js';
import * as admin from '../controllers/adminController.js';
import { publicLimiter } from '../middleware/rateLimiter.js';

const router = Router();
const teacher = [authenticate, authorize('instructor', 'admin')];
const adminOnly = [authenticate, authorize('admin')];
const student = [authenticate, authorize('student')];
const slugOnly = z.object({ certificateId: z.string().regex(/^[A-Za-z0-9-]{6,30}$/) });
const cursorQuery = z.object({ before: S.messagesQuery.shape.before, limit: S.messagesQuery.shape.limit });

router.use('/auth', authRoutes);
router.use('/', publicRoutes);
router.get('/settings/public', admin.publicSettings);

/* users */
router.get('/users/me', authenticate, user.getMe);
router.patch('/users/me', authenticate, validate({ body: S.updateProfileBody }), user.updateMe);
router.patch('/users/me/password', authenticate, validate({ body: S.changePasswordBody }), user.changePassword);
router.post('/testimonials', authenticate, validate({ body: S.testimonialBody }), user.submitTestimonial);

/* courses: public */
router.get('/courses', validate({ query: listCoursesQuery }), listCourses);
router.get('/courses/featured', featuredCourses);
router.get('/courses/mine', ...teacher, manage.myCourses);
router.get('/courses/manage/:id', ...teacher, validate({ params: S.idParam }), manage.getManagedCourse);
router.get('/courses/:slug/learn', authenticate, validate({ params: slugParam }), learn.getLearnContent);
router.get('/courses/:slug', validate({ params: slugParam }), getCourseBySlug);
/* courses: management */
router.post('/courses', ...teacher, validate({ body: S.createCourseBody }), manage.createCourse);
router.patch('/courses/:id', ...teacher, validate({ params: S.idParam, body: S.updateCourseBody }), manage.updateCourse);
router.delete('/courses/:id', ...teacher, validate({ params: S.idParam }), manage.deleteCourse);
router.patch('/courses/:id/publish', ...teacher, validate({ params: S.idParam, body: S.publishBody }), manage.setPublished);

/* curriculum */
router.post('/courses/:courseId/sections', ...teacher, validate({ params: S.courseIdParam, body: S.sectionBody }), cur.createSection);
router.patch('/courses/:courseId/sections/reorder', ...teacher, validate({ params: S.courseIdParam, body: S.reorderBody }), cur.reorderSections);
router.patch('/sections/:sectionId', ...teacher, validate({ params: S.sectionIdParam, body: S.sectionBody }), cur.updateSection);
router.delete('/sections/:sectionId', ...teacher, validate({ params: S.sectionIdParam }), cur.deleteSection);
router.post('/sections/:sectionId/lessons', ...teacher, validate({ params: S.sectionIdParam, body: S.createLessonBody }), cur.createLesson);
router.patch('/sections/:sectionId/lessons/reorder', ...teacher, validate({ params: S.sectionIdParam, body: S.reorderBody }), cur.reorderLessons);
router.patch('/lessons/:lessonId', ...teacher, validate({ params: S.lessonIdParam, body: S.updateLessonBody }), cur.updateLesson);
router.delete('/lessons/:lessonId', ...teacher, validate({ params: S.lessonIdParam }), cur.deleteLesson);

/* enrollment and progress */
router.post('/courses/:courseId/enroll', authenticate, validate({ params: S.courseIdParam }), learn.enroll);
router.get('/enrollments/me', ...student, learn.myEnrollments);
router.get('/courses/:courseId/progress', ...student, validate({ params: S.courseIdParam }), learn.courseProgress);
router.post('/lessons/:lessonId/complete', ...student, validate({ params: S.lessonIdParam }), learn.completeLesson);

/* quizzes */
router.post('/courses/:courseId/quizzes', ...teacher, validate({ params: S.courseIdParam, body: S.quizBody }), quiz.createQuiz);
router.get('/quizzes/mine', ...teacher, quiz.myQuizzes);
router.get('/quizzes/enrolled', ...student, quiz.enrolledQuizzes);
router.get('/quizzes/:quizId', authenticate, validate({ params: S.quizIdParam }), quiz.getQuiz);
router.patch('/quizzes/:quizId', ...teacher, validate({ params: S.quizIdParam, body: S.updateQuizBody }), quiz.updateQuiz);
router.delete('/quizzes/:quizId', ...teacher, validate({ params: S.quizIdParam }), quiz.deleteQuiz);
router.post('/quizzes/:quizId/start', ...student, validate({ params: S.quizIdParam }), quiz.startAttempt);
router.post('/quizzes/:quizId/attempts', ...student, validate({ params: S.quizIdParam, body: S.submitAttemptBody }), quiz.submitAttempt);
router.get('/quizzes/:quizId/attempts/me', ...student, validate({ params: S.quizIdParam }), quiz.myAttempts);

/* certificates */
router.get('/certificates/me', ...student, cert.myCertificates);
router.get('/certificates/verify/:certificateId', publicLimiter, validate({ params: slugOnly }), cert.verifyCertificate);
router.get('/certificates/:certificateId/pdf', authenticate, validate({ params: slugOnly }), cert.certificatePdf);

/* reviews and reports */
router.get('/courses/:courseId/reviews', validate({ params: S.courseIdParam, query: S.reviewsQuery }), review.listReviews);
router.get('/courses/:courseId/reviews/mine', authenticate, validate({ params: S.courseIdParam }), review.myReview);
router.post('/courses/:courseId/reviews', authenticate, validate({ params: S.courseIdParam, body: S.reviewBody }), review.createReview);
router.patch('/reviews/:reviewId', authenticate, validate({ params: S.reviewIdParam, body: S.reviewUpdateBody }), review.updateReview);
router.delete('/reviews/:reviewId', authenticate, validate({ params: S.reviewIdParam }), review.deleteReview);
router.post('/reports', authenticate, validate({ body: S.reportBody }), social.createReport);

/* notifications, messaging, discussions, study rooms */
router.get('/notifications', authenticate, validate({ query: S.notificationsQuery }), social.listNotifications);
router.patch('/notifications/read-all', authenticate, social.markAllRead);
router.patch('/notifications/:id/read', authenticate, validate({ params: S.idParam }), social.markRead);
router.post('/courses/:courseId/announcements', ...teacher, validate({ params: S.courseIdParam, body: S.announcementBody }), social.announce);
router.get('/conversations', authenticate, social.listConversations);
router.get('/conversations/contacts', authenticate, social.listContacts);
router.post('/conversations', authenticate, validate({ body: S.conversationBody }), social.startConversation);
router.get('/conversations/:id/messages', authenticate, validate({ params: S.idParam, query: S.messagesQuery }), social.listMessages);
router.get('/courses/:courseId/discussions', authenticate, validate({ params: S.courseIdParam, query: cursorQuery }), social.listDiscussion);
router.get('/study-rooms', authenticate, social.listRooms);
router.post('/study-rooms', authenticate, validate({ body: S.studyRoomBody }), social.createRoom);
router.delete('/study-rooms/:id', authenticate, validate({ params: S.idParam }), social.deleteRoom);

/* dashboards */
router.get('/student/dashboard', ...student, dash.studentDashboard);
router.get('/instructor/dashboard', ...teacher, dash.instructorDashboard);
router.get('/instructor/students', ...teacher, validate({ query: pagination }), dash.instructorStudents);
router.get('/instructor/analytics', ...teacher, dash.instructorAnalytics);

/* admin */
router.get('/admin/dashboard', ...adminOnly, admin.dashboard);
router.get('/admin/users', ...adminOnly, validate({ query: S.adminUsersQuery }), admin.listUsers);
router.patch('/admin/users/:id/role', ...adminOnly, validate({ params: S.idParam, body: S.roleBody }), admin.setRole);
router.patch('/admin/users/:id/status', ...adminOnly, validate({ params: S.idParam, body: S.activeBody }), admin.setActive);
router.get('/admin/courses', ...adminOnly, validate({ query: S.adminCoursesQuery }), admin.listAllCourses);
router.patch('/admin/courses/:id/status', ...adminOnly, validate({ params: S.idParam, body: S.courseStatusBody }), admin.setCourseStatus);
router.post('/admin/categories', ...adminOnly, validate({ body: S.categoryBody }), admin.createCategory);
router.patch('/admin/categories/:id', ...adminOnly, validate({ params: S.idParam, body: S.categoryBody }), admin.updateCategory);
router.delete('/admin/categories/:id', ...adminOnly, validate({ params: S.idParam }), admin.deleteCategory);
router.get('/admin/reviews', ...adminOnly, validate({ query: pagination }), admin.listAllReviews);
router.patch('/admin/reviews/:id', ...adminOnly, validate({ params: S.idParam, body: S.reviewModerationBody }), admin.moderateReview);
router.get('/admin/reports', ...adminOnly, validate({ query: S.reportsQuery }), admin.listReports);
router.patch('/admin/reports/:id', ...adminOnly, validate({ params: S.idParam, body: S.reportResolveBody }), admin.resolveReport);
router.get('/admin/settings', ...adminOnly, admin.getAdminSettings);
router.patch('/admin/settings', ...adminOnly, validate({ body: S.settingsBody }), admin.updateSettings);
router.get('/admin/testimonials', ...adminOnly, admin.listTestimonialsAdmin);
router.patch('/admin/testimonials/:id', ...adminOnly, validate({ params: S.idParam, body: S.approveBody }), admin.approveTestimonial);
router.delete('/admin/testimonials/:id', ...adminOnly, validate({ params: S.idParam }), admin.deleteTestimonial);

export default router;
