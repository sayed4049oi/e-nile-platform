import jwt from 'jsonwebtoken';

export function requireAuth(req, res, next) {
  const h = req.headers.authorization || '';
  const t = h.startsWith('Bearer ') ? h.slice(7) : null;
  if (!t) return res.status(401).json({ error: 'غير مصرح' });
  try {
    req.user = jwt.verify(t, process.env.JWT_SECRET);
    next();
  } catch {
    return res.status(401).json({ error: 'انتهت الجلسة' });
  }
}

export const requireAdmin = (req, res, next) =>
  req.user?.role === 'admin' ? next() : res.status(403).json({ error: 'ممنوع' });

export const requireStudent = (req, res, next) =>
  req.user?.role === 'student' ? next() : res.status(403).json({ error: 'ممنوع' });
