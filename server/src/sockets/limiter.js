// Tiny per-socket rate limiter: allow(socket, 'message', 20, 10_000) permits 20 events per 10 seconds.
export function allow(socket, key, max, windowMs) {
  const now = Date.now();
  socket.data.hits ||= new Map();
  const recent = (socket.data.hits.get(key) || []).filter((t) => now - t < windowMs);
  if (recent.length >= max) { socket.data.hits.set(key, recent); return false; }
  recent.push(now);
  socket.data.hits.set(key, recent);
  return true;
}

// Wraps a handler so malformed payloads and thrown errors become a clean ack instead of a crash.
export const safe = (socket, schema, limit, handler) => async (payload, ack) => {
  const reply = typeof ack === 'function' ? ack : () => {};
  try {
    if (limit && !allow(socket, limit.key, limit.max, limit.windowMs)) return reply({ ok: false, message: 'You are sending too fast. Slow down a little.' });
    const data = schema ? schema.parse(payload) : payload;
    return reply({ ok: true, ...(await handler(data)) });
  } catch (err) {
    return reply({ ok: false, message: err.isOperational ? err.message : err.name === 'ZodError' ? 'Invalid request.' : 'Something went wrong.' });
  }
};
