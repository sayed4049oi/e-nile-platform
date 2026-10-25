import { Router } from 'express';
import { prisma } from '../lib/prisma.js';
import { requireAuth, requireAdmin } from '../middleware/auth.js';

const router = Router();
router.use(requireAuth, requireAdmin);

router.get('/room/:roomId', async (req, res) => {
  res.json(await prisma.question.findMany({
    where: { roomId: req.params.roomId },
    include: { choices: { orderBy: { position: 'asc' } } },
    orderBy: { position: 'asc' },
  }));
});

router.post('/', async (req, res) => {
  const { roomId, text, points, choices } = req.body || {};
  if (!roomId || !text || !Array.isArray(choices) || choices.length < 2)
    return res.status(400).json({ error: 'بيانات ناقصة' });
  if (!choices.some(c => c.isCorrect))
    return res.status(400).json({ error: 'لازم إجابة صحيحة' });
  const pos = await prisma.question.count({ where: { roomId } });
  const q = await prisma.question.create({
    data: {
      roomId, text, points: Number(points) || 1, position: pos,
      choices: {
        create: choices.map((c, i) => ({
          text: c.text, isCorrect: !!c.isCorrect, position: i,
        })),
      },
    },
    include: { choices: true },
  });
  res.status(201).json(q);
});

router.post('/room/:roomId/bulk', async (req, res) => {
  const { items } = req.body || {};
  if (!Array.isArray(items)) return res.status(400).json({ error: 'items مطلوبة' });
  let pos = await prisma.question.count({ where: { roomId: req.params.roomId } });
  let created = 0;
  for (const item of items) {
    if (!item.text || !Array.isArray(item.choices)) continue;
    await prisma.question.create({
      data: {
        roomId: req.params.roomId,
        text: item.text,
        points: item.points || 1,
        position: pos++,
        choices: {
          create: item.choices.map((c, i) => ({
            text: c.text, isCorrect: !!c.isCorrect, position: i,
          })),
        },
      },
    });
    created++;
  }
  res.json({ created });
});

router.delete('/:id', async (req, res) => {
  await prisma.question.delete({ where: { id: req.params.id } });
  res.json({ ok: true });
});

export default router;
