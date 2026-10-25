import { Router } from 'express';
import { prisma } from '../lib/prisma.js';
import { requireAuth, requireAdmin } from '../middleware/auth.js';

const router = Router();
router.use(requireAuth, requireAdmin);

router.get('/room/:roomId', async (req, res) => {
  const room = await prisma.room.findUnique({
    where: { id: req.params.roomId },
    include: {
      _count: { select: { students: true, questions: true } },
      attempts: {
        include: { student: true, violations: true },
        orderBy: { startedAt: 'desc' },
      },
    },
  });
  if (!room) return res.status(404).json({ error: 'غير موجود' });
  const submitted = room.attempts.filter(a => a.submittedAt).length;
  const scores = room.attempts.filter(a => a.score != null).map(a => a.score);
  res.json({
    room: { id: room.id, name: room.name, isOpen: room.isOpen },
    counts: {
      students: room._count.students,
      questions: room._count.questions,
      submitted,
      inProgress: room.attempts.length - submitted,
      totalViolations: room.attempts.reduce((s, a) => s + a.violations.length, 0),
    },
    avgScore: scores.length ? scores.reduce((a, b) => a + b, 0) / scores.length : 0,
    attempts: room.attempts.map(a => ({
      id: a.id,
      code: a.code,
      student: { name: a.student.name, universityId: a.student.universityId },
      startedAt: a.startedAt,
      submittedAt: a.submittedAt,
      score: a.score,
      violations: a.violations,
    })),
  });
});

export default router;
