import api from './api.js';

export const getNotifications = (params, signal) => api.get('/notifications', { params, signal });
export const markNotificationRead = (id) => api.patch(`/notifications/${id}/read`);
export const markAllNotificationsRead = () => api.patch('/notifications/read-all');
export const getConversations = (signal) => api.get('/conversations', { signal });
export const getContacts = (signal) => api.get('/conversations/contacts', { signal });
export const startConversation = (userId) => api.post('/conversations', { userId });
export const getMessages = (id, params, signal) => api.get(`/conversations/${id}/messages`, { params, signal });
export const getDiscussion = (courseId, params, signal) => api.get(`/courses/${courseId}/discussions`, { params, signal });
export const getStudyRooms = (signal) => api.get('/study-rooms', { signal });
export const createStudyRoom = (payload) => api.post('/study-rooms', payload);
export const deleteStudyRoom = (id) => api.delete(`/study-rooms/${id}`);
export const submitTestimonial = (quote) => api.post('/testimonials', { quote });
export const updateProfile = (payload) => api.patch('/users/me', payload);
export const changePassword = (payload) => api.patch('/users/me/password', payload);
