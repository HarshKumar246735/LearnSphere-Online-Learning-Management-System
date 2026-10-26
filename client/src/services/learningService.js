import api from './api.js';

export const getLearnContent = (slug, signal) => api.get(`/courses/${encodeURIComponent(slug)}/learn`, { signal });
export const completeLesson = (lessonId) => api.post(`/lessons/${lessonId}/complete`);
export const getMyEnrollments = (signal) => api.get('/enrollments/me', { signal });
export const getStudentDashboard = (signal) => api.get('/student/dashboard', { signal });
export const getEnrolledQuizzes = (signal) => api.get('/quizzes/enrolled', { signal });
export const getQuiz = (id, signal) => api.get(`/quizzes/${id}`, { signal });
export const startQuiz = (id) => api.post(`/quizzes/${id}/start`);
export const submitQuiz = (id, payload) => api.post(`/quizzes/${id}/attempts`, payload);
export const getMyAttempts = (id, signal) => api.get(`/quizzes/${id}/attempts/me`, { signal });
export const getMyCertificates = (signal) => api.get('/certificates/me', { signal });
export const verifyCertificate = (id, signal) => api.get(`/certificates/verify/${encodeURIComponent(id)}`, { signal });
export const downloadCertificate = (id) => api.get(`/certificates/${encodeURIComponent(id)}/pdf`, { responseType: 'blob' });
export const getMyReview = (courseId, signal) => api.get(`/courses/${courseId}/reviews/mine`, { signal });
export const saveReview = (courseId, payload) => api.post(`/courses/${courseId}/reviews`, payload);
export const updateReview = (id, payload) => api.patch(`/reviews/${id}`, payload);
export const deleteReview = (id) => api.delete(`/reviews/${id}`);
export const reportContent = (payload) => api.post('/reports', payload);
