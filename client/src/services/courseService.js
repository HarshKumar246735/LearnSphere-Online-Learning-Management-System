import api from './api.js';

export const listCourses = (params, signal) => api.get('/courses', { params, signal });
export const getFeaturedCourses = (signal) => api.get('/courses/featured', { signal });
export const getCourse = (slug, signal) => api.get(`/courses/${encodeURIComponent(slug)}`, { signal });
export const getCategories = (signal) => api.get('/categories', { signal });
export const getStats = (signal) => api.get('/stats', { signal });
export const getTestimonials = (signal) => api.get('/testimonials', { signal });
export const enrollInCourse = (courseId) => api.post(`/courses/${courseId}/enroll`);
export const sendContactMessage = (payload) => api.post('/contact', payload);
