export const dashboardPath = (role) => ({ student: '/student/dashboard', instructor: '/instructor/dashboard', admin: '/admin/dashboard' }[role] || '/');

// Only same-site relative paths are allowed as post-login redirects (prevents open redirects).
export const safeNext = (next, fallback = '/') => (typeof next === 'string' && /^\/(?!\/)/.test(next) ? next : fallback);
