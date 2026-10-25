import { Router } from 'express';
import { randomUUID } from 'crypto';
import { prisma } from '../lib/prisma.js';
import { requireAuth, requireStudent } from '../middleware/auth.js';

const router = Router();
router.use(requireAuth, requireStudent);

router.post('/start', async (req, res) => {
  const { roomId } = req.body || {};
  const studentId = req.user.sub;
  const room = await prisma.room.findUnique({ where: { id: roomId } });
  if (!room) return res.status(404).json({ error: 'القاعة غير موجودة' });
  if (!room.isOpen) return res.status(403).json({ error: 'القاعة مغلقة' });
  const en = await prisma.roomStudent.findUnique({
    where: { roomId_studentId: { roomId, studentId } },
  });
  if (!en) return res.status(403).json({ error: 'غير مسجل' });

  let attempt = await prisma.attempt.findFirst({
    where: { roomId, studentId },
    orderBy: { startedAt: 'desc' },
  });
  if (attempt && attempt.submittedAt)
    return res.status(400).json({ error: 'سبق التسليم' });
  if (!attempt) {
    attempt = await prisma.attempt.create({
      data: {
        roomId, studentId,
        code: 'EN-' + randomUUID().slice(0, 8).toUpperCase(),
        ipAddress: req.ip,
        userAgent: req.headers['user-agent'],
      },
    });
  }

  let questions = await prisma.question.findMany({
    where: { roomId },
    include: {
      choices: {
        orderBy: { position: 'asc' },
        select: { id: true, text: true, position: true },
      },
    },
    orderBy: { position: 'asc' },
  });
  if (room.randomizeQuestions) {
    for (let i = questions.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [questions[i], questions[j]] = [questions[j], questions[i]];
    }
  }

  const elapsed = (Date.now() - new Date(attempt.startedAt).getTime()) / 1000;
  res.json({
    attempt: { id: attempt.id, code: attempt.code },
    room: {
      id: room.id, name: room.name, durationMin: room.durationMin,
      protection: {
        preventCopy: room.preventCopy,
        preventRightClick: room.preventRightClick,
        detectTabSwitch: room.detectTabSwitch,
        randomizeQuestions: room.randomizeQuestions,
        enableCamera: room.enableCamera,
        enableFaceCheck: room.enableFaceCheck,
        allowReview: room.allowReview,
        autoLockOnTime: room.autoLockOnTime,
      },
    },
    questions,
    remainingSeconds: Math.max(0, Math.floor(room.durationMin * 60 - elapsed)),
  });
});

router.post('/:attemptId/answer', async (req, res) => {
  const { questionId, choiceId } = req.body || {};
  const a = await prisma.attempt.findUnique({ where: { id: req.params.attemptId } });
  if (!a || a.studentId !== req.user.sub) return res.status(403).json({ error: 'ممنوع' });
  if (a.submittedAt) return res.status(400).json({ error: 'تم التسليم' });
  await prisma.answer.upsert({
    where: { attemptId_questionId: { attemptId: a.id, questionId } },
    update: { choiceId },
    create: { attemptId: a.id, questionId, choiceId },
  });
  res.json({ ok: true });
});

router.post('/:attemptId/violation', async (req, res) => {
  const { type, details } = req.body || {};
  const a = await prisma.attempt.findUnique({ where: { id: req.params.attemptId } });
  if (!a || a.studentId !== req.user.sub) return res.status(403).json({ error: 'ممنوع' });
  if (a.submittedAt) return res.status(400).json({ error: 'تم التسليم' });
  await prisma.violationLog.create({ data: { attemptId: a.id, type, details } });
  req.app.get('io').to('room:' + a.roomId).emit('violation', {
    attemptId: a.id, type, details,
  });
  res.json({ ok: true });
});

router.post('/:attemptId/submit', async (req, res) => {
  const a = await prisma.attempt.findUnique({
    where: { id: req.params.attemptId },
    include: {
      answers: { include: { choice: true } },
      room: { include: { questions: { include: { choices: true } } } },
    },
  });
  if (!a || a.studentId !== req.user.sub) return res.status(403).json({ error: 'ممنوع' });
  if (a.submittedAt) return res.json({ ok: true, code: a.code });

  let score = 0, total = 0;
  for (const q of a.room.questions) {
    total += q.points;
    const ans = a.answers.find(x => x.questionId === q.id);
    if (ans && ans.choice && ans.choice.isCorrect) score += q.points;
  }
  const upd = await prisma.attempt.update({
    where: { id: a.id },
    data: { submittedAt: new Date(), score, status: 'submitted' },
  });
  req.app.get('io').to('room:' + a.roomId).emit('attempt:submitted', {
    attemptId: upd.id, code: upd.code, score, total,
  });
  res.json({ ok: true, code: upd.code, score, total, allowReview: a.room.allowReview });
});

router.get('/:attemptId/review', async (req, res) => {
  const a = await prisma.attempt.findUnique({
    where: { id: req.params.attemptId },
    include: {
      answers: true,
      room: {
        include: {
          questions: {
            include: { choices: { orderBy: { position: 'asc' } } },
            orderBy: { position: 'asc' },
          },
        },
      },
    },
  });
  if (!a || a.studentId !== req.user.sub) return res.status(403).json({ error: 'ممنوع' });
  if (!a.submittedAt) return res.status(400).json({ error: 'لم يتم التسليم' });
  if (!a.room.allowReview)
    return res.status(403).json({ error: 'المراجعة غير مسموحة' });
  const items = a.room.questions.map(q => {
    const ans = a.answers.find(x => x.questionId === q.id);
    return {
      question: q.text,
      points: q.points,
      choices: q.choices.map(c => ({
        id: c.id, text: c.text, isCorrect: c.isCorrect,
        chosen: ans && ans.choiceId === c.id,
      })),
      isCorrect: !!(q.choices.find(c => c.id === (ans && ans.choiceId)) || {}).isCorrect,
    };
  });
  res.json({ code: a.code, score: a.score, submittedAt: a.submittedAt, items });
});

export default router;
