// Holds the Socket.IO instance so REST controllers and services can push events without importing the socket layer.
let io = null;
const sockets = new Map(); // userId -> Set(socketId)

export const setIO = (instance) => { io = instance; };
export const getIO = () => io;
export const emitToUser = (userId, event, payload) => io?.to(`user:${userId}`).emit(event, payload);

export const addSocket = (userId, socketId) => {
  const key = String(userId);
  const wasOffline = !sockets.has(key);
  if (wasOffline) sockets.set(key, new Set());
  sockets.get(key).add(socketId);
  return wasOffline;
};
export const removeSocket = (userId, socketId) => {
  const key = String(userId);
  const set = sockets.get(key);
  if (!set) return false;
  set.delete(socketId);
  if (set.size === 0) { sockets.delete(key); return true; }
  return false;
};
export const isOnline = (userId) => sockets.has(String(userId));
