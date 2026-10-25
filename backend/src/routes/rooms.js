import { Router } from 'express';
import multer from 'multer';
import ExcelJS from 'exceljs';
import { prisma } from '../lib/prisma.js';
import { requireAuth, requireAdmin } from '../middleware/auth.js';

const router = Router();
const upload = multer({ storage: multer.memoryStorage() });
router.use(requireAuth, requireAdmin);

router.get('/', async (_req, res) => {
  res.json(await prisma.room.findMany({
    orderBy: { createdAt: 'desc' },
    include: { _count: { select: { students: true, questions: true } } },
  }));
});

router.post('/', async (req, res) => {
  const { name, description, durationMin } = req.body || {};
  if (!name) return res.status(400).json({ error: 'اسم القاعة مطلوب' });
  const room = await prisma.room.create({
    data: { name, description, durationMin: Number(durationMin) || 60 },
  });
  res.status(201).json(room);
});

router.post('/:id/open', async (req, res) => {
  const b = req.body || {};
  const room = await prisma.room.update({
    where: { id: req.params.id },
    data: {
      isOpen: true,
      openedAt: new Date(),
      closedAt: null,
      protectionSetAt: new Date(),
      preventCopy: !!b.preventCopy,
      preventRightClick: !!b.preventRightClick,
      detectTabSwitch: !!b.detectTabSwitch,
      randomizeQuestions: !!b.randomizeQuestions,
      enableCamera: !!b.enableCamera,
      enableFaceCheck: !!b.enableFaceCheck,
      allowReview: !!b.allowReview,
      autoLockOnTime: b.autoLockOnTime !== false,
    },
  });
  req.app.get('io').emit('room:opened', { roomId: room.id });
  res.json(room);
});

router.post('/:id/close', async (req, res) => {
  const room = await prisma.room.update({
    where: { id: req.params.id },
    data: { isOpen: false, closedAt: new Date() },
  });
  req.app.get('io').emit('room:closed', { roomId: room.id });
  res.json(room);
});

router.post('/:id/students/import', upload.single('file'), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'الملف مطلوب' });
  const wb = new ExcelJS.Workbook();
  await wb.xlsx.load(req.file.buffer);
  const ws = wb.worksheets[0];
  const out = { added: 0, errors: [] };
  const rows = [];
  ws.eachRow((row, i) => {
    if (i === 1) return;
    const name = row.getCell(1).value && row.getCell(1).value.toString().trim();
    const uniId = row.getCell(2).value && row.getCell(2).value.toString().trim();
    const pin = (row.getCell(3).value && row.getCell(3).value.toString().trim()) || null;
    if (name && uniId) rows.push({ name, uniId, pin });
  });
  for (const r of rows) {
    try {
      const s = await prisma.student.upsert({
        where: { universityId: r.uniId },
        update: { name: r.name, ...(r.pin && { studentPin: r.pin }) },
        create: { name: r.name, universityId: r.uniId, studentPin: r.pin },
      });
      await prisma.roomStudent.upsert({
        where: { roomId_studentId: { roomId: req.params.id, studentId: s.id } },
        update: {},
        create: { roomId: req.params.id, studentId: s.id },
      });
      out.added++;
    } catch (e) {
      out.errors.push({ uniId: r.uniId, error: e.message });
    }
  }
  res.json(out);
});

router.get('/:id/students', async (req, res) => {
  res.json(await prisma.roomStudent.findMany({
    where: { roomId: req.params.id },
    include: { student: true },
  }));
});

router.delete('/:id/students/:studentId', async (req, res) => {
  await prisma.roomStudent.delete({
    where: {
      roomId_studentId: { roomId: req.params.id, studentId: req.params.studentId },
    },
  });
  res.json({ ok: true });
});

export default router;
