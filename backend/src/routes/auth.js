import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '../lib/prisma.js';
import { requireAuth, requireAdmin } from '../middleware/auth.js';

const router = Router();

router.post('/admin/login', async (req, res) => {
  const { username, password } = req.body || {};
  if (!username || !password) return res.status(400).json({ error: 'بيانات ناقصة' });
  const admin = await prisma.admin.findUnique({ where: { username } });
  if (!admin || !(await bcrypt.compare(password, admin.password)))
    return res.status(401).json({ error: 'بيانات غير صحيحة' });
  const token = jwt.sign(
    { sub: admin.id, role: 'admin' },
    process.env.JWT_SECRET,
    { expiresIn: '12h' }
  );
  res.json({ token, admin: { id: admin.id, username, name: admin.name } });
});

router.get('/admin/me', requireAuth, requireAdmin, async (req, res) => {
  const a = await prisma.admin.findUnique({ where: { id: req.user.sub } });
  if (!a) return res.status(404).json({ error: 'غير موجود' });
  res.json({ id: a.id, username: a.username, name: a.name });
});

router.post('/student/enter', async (req, res) => {
  const { universityId, pin } = req.body || {};
  if (!universityId) return res.status(400).json({ error: 'الرقم الجامعي مطلوب' });
  const student = await prisma.student.findUnique({ where: { universityId } });
  if (!student) return res.status(404).json({ error: 'الرقم غير مسجل' });
  if (student.studentPin && student.studentPin !== pin)
    return res.status(401).json({ error: 'الرقم السري مطلوب', needPin: true });
  const enrollments = await prisma.roomStudent.findMany({
    where: { studentId: student.id, room: { isOpen: true } },
    include: { room: true },
  });
  if (!enrollments.length)
    return res.status(403).json({ error: 'لا قاعات مفتوحة' });
  const token = jwt.sign(
    { sub: student.id, role: 'student' },
    process.env.JWT_SECRET,
    { expiresIn: '4h' }
  );
  res.json({
    token,
    student: { id: student.id, name: student.name, universityId: student.universityId },
    rooms: enrollments.map(e => ({
      id: e.room.id, name: e.room.name, durationMin: e.room.durationMin,
    })),
  });
});

export default router;
