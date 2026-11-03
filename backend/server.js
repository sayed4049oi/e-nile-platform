const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const fs = require('fs');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json({ limit: '10mb' }));

// مجلد الصور
const UPLOADS_DIR = path.join(__dirname, 'uploads');
if (!fs.existsSync(UPLOADS_DIR)) fs.mkdirSync(UPLOADS_DIR, { recursive: true });
app.use('/uploads', express.static(UPLOADS_DIR));

// الاتصال بقاعدة البيانات
if (process.env.MONGO_URI) {
  mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('✅ Connected to MongoDB Atlas successfully!'))
    .catch((err) => console.error('❌ MongoDB connection error:', err));
} else {
  console.warn('⚠️ MONGO_URI is not configured; database routes will be unavailable.');
}

// ===== Models =====
const Admin = mongoose.model('Admin', new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  name: { type: String, required: true },
  isSuper: { type: Boolean, default: false }
}));
const Dept = mongoose.model('Dept', new mongoose.Schema({ name: String }));
const Sub = mongoose.model('Sub', new mongoose.Schema({ departmentId: String, name: String }));
const Template = mongoose.model('Template', new mongoose.Schema({ name: String, durationMin: Number, protection: Object }));
const Room = mongoose.model('Room', new mongoose.Schema({
  subjectId: String, name: String, durationMin: Number, pin: String,
  status: String, isGradesPublished: Boolean, isOpen: Boolean,
  scheduledOpenAt: Date, scheduledCloseAt: Date, questions: Array, protection: Object
}));
const Student = mongoose.model('Student', new mongoose.Schema({ name: String, universityId: String }));
const DeptStudent = mongoose.model('DeptStudent', new mongoose.Schema({ departmentId: String, studentId: String }));
const RoomStudent = mongoose.model('RoomStudent', new mongoose.Schema({ roomId: String, studentId: String }));
const Attempt = mongoose.model('Attempt', new mongoose.Schema({ roomId: String, studentId: String, answers: Object, violations: Array, submittedAt: Date, score: Number, total: Number }));

const JWT_SECRET = process.env.JWT_SECRET || 'secret';
const uuid = () => crypto.randomUUID();
const AI_PROVIDER = process.env.AI_PROVIDER || 'gemini';
const AI_MODEL = process.env.AI_MODEL || (AI_PROVIDER === 'grok' ? 'grok-2-latest' : 'gemini-2.0-flash');

// ===== Middlewares =====
const auth = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'غير مصرح' });
  try { req.user = jwt.verify(token, JWT_SECRET); next(); } catch { res.status(401).json({ error: 'انتهت' }); }
};
const adminAuth = (req, res, next) => {
  auth(req, res, () => {
    if (req.user.role !== 'admin') return res.status(403).json({ error: 'صلاحية إدارية مطلوبة' });
    next();
  });
};

function extractJson(text) {
  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/i);
  const candidate = (fenced ? fenced[1] : text).trim();
  const start = candidate.indexOf('{');
  const end = candidate.lastIndexOf('}');
  if (start < 0 || end < start) throw new Error('لم يرجع النموذج JSON صالحاً');
  return JSON.parse(candidate.slice(start, end + 1));
}

function normalizeQuestions(payload, requestedCount) {
  const source = Array.isArray(payload) ? payload : payload.questions;
  if (!Array.isArray(source)) throw new Error('استجابة النموذج لا تحتوي على أسئلة');
  return source.slice(0, requestedCount).map((question, index) => {
    const choices = Array.isArray(question.choices) ? question.choices : [];
    if (!question.text || (question.type !== 'essay' && choices.length < 2)) throw new Error(`السؤال رقم ${index + 1} غير مكتمل`);
    const correctIndex = choices.findIndex(choice => choice.isCorrect === true || choice.isCorrect === 1);
    return {
      id: uuid(),
      text: String(question.text).trim(),
      type: question.type === 'essay' ? 'essay' : question.type === 'tf' ? 'tf' : 'mcq',
      points: Number(question.points) > 0 ? Number(question.points) : 1,
      choices: choices.map((choice, choiceIndex) => ({
        id: uuid(),
        text: String(choice.text || '').trim(),
        isCorrect: Boolean(choice.isCorrect) || choiceIndex === correctIndex
      }))
    };
  });
}

async function generateWithAI({ provider, model, sourceText, count, type, difficulty, language, existingQuestions, instruction }) {
  const selectedProvider = provider || AI_PROVIDER;
  const selectedModel = model || AI_MODEL;
  const format = type === 'essay'
    ? 'essay'
    : type === 'tf' ? 'true/false' : 'multiple choice';
  const prompt = `You create university exam questions from source material.
Return ONLY valid JSON in this exact shape: {"questions":[{"text":"...","type":"mcq|tf|essay","points":1,"choices":[{"text":"...","isCorrect":true}]}]}.
Create exactly ${count} questions when the source supports it. Use ${format} questions, difficulty ${difficulty}, language ${language}.
For essay questions, include an empty choices array only if necessary; otherwise use choices with one model answer marked isCorrect true.
Do not invent facts outside the source. Keep one correct answer for MCQ/TF. ${instruction || ''}
${existingQuestions ? `Existing exam questions to improve or rewrite:\n${JSON.stringify(existingQuestions)}` : ''}
Source material:
${sourceText}`;
  let response;
  if (selectedProvider === 'grok') {
    if (!process.env.GROK_API_KEY) throw new Error('GROK_API_KEY غير مضبوط في الخادم');
    response = await fetch('https://api.x.ai/v1/chat/completions', {
      method: 'POST',
      headers: { Authorization: `Bearer ${process.env.GROK_API_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ model: selectedModel, temperature: 0.2, messages: [{ role: 'system', content: 'Return JSON only.' }, { role: 'user', content: prompt }] })
    });
  } else {
    if (!process.env.GEMINI_API_KEY) throw new Error('GEMINI_API_KEY غير مضبوط في الخادم');
    response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(selectedModel)}:generateContent?key=${encodeURIComponent(process.env.GEMINI_API_KEY)}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ generationConfig: { temperature: 0.2, responseMimeType: 'application/json' }, contents: [{ parts: [{ text: prompt }] }] })
    });
  }
  const body = await response.json();
  if (!response.ok) throw new Error(body.error?.message || 'فشل الاتصال بمزود الذكاء الاصطناعي');
  const text = selectedProvider === 'grok'
    ? body.choices?.[0]?.message?.content
    : body.candidates?.[0]?.content?.parts?.map(part => part.text || '').join('');
  return normalizeQuestions(extractJson(text || ''), count);
}

// ===== Auth =====
app.post('/api/auth/admin/login', async (req, res) => {
  const admin = await Admin.findOne({ username: req.body.username });
  if (!admin || !(await bcrypt.compare(req.body.password, admin.password))) return res.status(401).json({ error: 'بيانات خاطئة' });
  const token = jwt.sign({ id: admin._id, role: 'admin' }, JWT_SECRET, { expiresIn: '12h' });
  res.json({ token, admin: { id: admin._id, name: admin.name, isSuper: admin.isSuper } });
});

app.post('/api/auth/student/enter', async (req, res) => {
  const student = await Student.findOne({ universityId: req.body.universityId });
  if (!student) return res.status(404).json({ error: 'الرقم غير مسجل' });
  const enrolled = await RoomStudent.find({ studentId: student._id });
  await updateScheduledRooms();
  const rooms = await Room.find({ _id: { $in: enrolled.map(e => e.roomId) }, isOpen: true });
  const token = jwt.sign({ id: student._id, role: 'student' }, JWT_SECRET, { expiresIn: '4h' });
  res.json({ token, student, rooms });
});

app.get('/api/health', (_req, res) => res.json({ ok: true, name: 'كلية شرق النيل' }));

app.get('/api/ai/config', adminAuth, (_req, res) => {
  res.json({ provider: AI_PROVIDER, model: AI_MODEL, configured: Boolean(process.env.GEMINI_API_KEY || process.env.GROK_API_KEY) });
});

app.post('/api/ai/generate-questions', adminAuth, async (req, res) => {
  const { provider, model, sourceText, count, type, difficulty, language, existingQuestions, instruction } = req.body;
  const requestedCount = Math.max(1, Math.min(50, Number(count) || 10));
  if (!sourceText || sourceText.trim().length < 30) return res.status(400).json({ error: 'المحتوى المصدر قصير جداً' });
  try {
    const questions = await generateWithAI({ provider, model, sourceText: sourceText.slice(0, 100000), count: requestedCount, type, difficulty, language, existingQuestions, instruction });
    res.json({ questions, provider: provider || AI_PROVIDER, model: model || AI_MODEL });
  } catch (error) {
    console.error('AI question generation failed:', error);
    res.status(502).json({ error: error.message || 'تعذر إنشاء الأسئلة' });
  }
});

// ===== Admin Management =====
app.get('/api/admins', adminAuth, async (req, res) => {
  const admins = await Admin.find().select('-password').sort({ name: 1 });
  res.json(admins.map(a => ({ ...a._doc, id: a._id })));
});

app.post('/api/admins', adminAuth, async (req, res) => {
  const { username, password, name } = req.body;
  if (!username || !password || !name) return res.status(400).json({ error: 'جميع البيانات مطلوبة' });
  if (await Admin.exists({ username })) return res.status(409).json({ error: 'اسم المستخدم موجود مسبقاً' });
  const admin = await Admin.create({ username, name, password: await bcrypt.hash(password, 10), isSuper: false });
  res.status(201).json({ id: admin._id, name: admin.name, username: admin.username, isSuper: admin.isSuper });
});

app.put('/api/admins/:id', adminAuth, async (req, res) => {
  const updates = { name: req.body.name, username: req.body.username };
  if (req.body.password) updates.password = await bcrypt.hash(req.body.password, 10);
  const admin = await Admin.findByIdAndUpdate(req.params.id, updates, { new: true, runValidators: true }).select('-password');
  if (!admin) return res.status(404).json({ error: 'الأدمن غير موجود' });
  res.json({ ...admin._doc, id: admin._id });
});

app.delete('/api/admins/:id', adminAuth, async (req, res) => {
  const admin = await Admin.findById(req.params.id);
  if (!admin) return res.status(404).json({ error: 'الأدمن غير موجود' });
  if (admin.isSuper) return res.status(403).json({ error: 'لا يمكن حذف المدير العام' });
  await admin.deleteOne();
  res.json({ ok: true });
});

// ===== Admin Routes =====
app.get('/api/system/backup', adminAuth, async (req, res) => {
  const data = {
    version: 1,
    createdAt: new Date().toISOString(),
    admins: await Admin.find().lean(),
    departments: await Dept.find().lean(),
    subjects: await Sub.find().lean(),
    templates: await Template.find().lean(),
    rooms: await Room.find().lean(),
    students: await Student.find().lean(),
    departmentStudents: await DeptStudent.find().lean(),
    roomStudents: await RoomStudent.find().lean(),
    attempts: await Attempt.find().lean()
  };
  res.header('Content-Disposition', 'attachment; filename="e-nile-backup.json"');
  res.send(JSON.stringify(data, null, 2));
});

app.post('/api/system/restore', adminAuth, async (req, res) => {
  const backup = req.body;
  const collections = [
    ['admins', Admin], ['departments', Dept], ['subjects', Sub], ['templates', Template],
    ['rooms', Room], ['students', Student], ['departmentStudents', DeptStudent],
    ['roomStudents', RoomStudent], ['attempts', Attempt]
  ];
  if (!backup || collections.some(([key]) => !Array.isArray(backup[key]))) {
    return res.status(400).json({ error: 'ملف النسخة الاحتياطية غير صالح أو ناقص' });
  }
  try {
    for (const [, Model] of collections) await Model.deleteMany({});
    for (const [key, Model] of collections) if (backup[key].length) await Model.insertMany(backup[key], { ordered: true });
    res.json({ ok: true });
  } catch (err) {
    console.error('Restore failed:', err);
    res.status(400).json({ error: 'تعذر استرجاع النسخة الاحتياطية' });
  }
});

app.post('/api/system/reset', adminAuth, async (req, res) => {
  await Dept.deleteMany({}); await Sub.deleteMany({}); await Room.deleteMany({}); await Student.deleteMany({}); await DeptStudent.deleteMany({}); await RoomStudent.deleteMany({}); await Attempt.deleteMany({}); await Template.deleteMany({});
  res.json({ ok: true });
});

app.get('/api/departments', adminAuth, async (req, res) => res.json(await Dept.find()));
app.post('/api/departments', adminAuth, async (req, res) => res.json(await Dept.create({ name: req.body.name })));
app.delete('/api/departments/:id', adminAuth, async (req, res) => {
  const deptId = req.params.id;
  const subs = await Sub.find({ departmentId: deptId });
  const subIds = subs.map(s => s._id.toString());
  await Sub.deleteMany({ departmentId: deptId });
  const rooms = await Room.find({ subjectId: { $in: subIds } });
  const roomIds = rooms.map(r => r._id.toString());
  await Room.deleteMany({ subjectId: { $in: subIds } });
  await RoomStudent.deleteMany({ roomId: { $in: roomIds } });
  await Attempt.deleteMany({ roomId: { $in: roomIds } });
  await DeptStudent.deleteMany({ departmentId: deptId });
  await Dept.deleteOne({ _id: deptId });
  res.json({ ok: true });
});

app.get('/api/subjects', adminAuth, async (req, res) => res.json(await Sub.find()));
app.post('/api/subjects', adminAuth, async (req, res) => res.json(await Sub.create(req.body)));
app.delete('/api/subjects/:id', adminAuth, async (req, res) => {
  const subId = req.params.id;
  const rooms = await Room.find({ subjectId: subId });
  const roomIds = rooms.map(r => r._id.toString());
  await Room.deleteMany({ subjectId: subId });
  await RoomStudent.deleteMany({ roomId: { $in: roomIds } });
  await Attempt.deleteMany({ roomId: { $in: roomIds } });
  await Sub.deleteOne({ _id: subId });
  res.json({ ok: true });
});

app.get('/api/templates', adminAuth, async (req, res) => res.json(await Template.find()));
app.post('/api/templates', adminAuth, async (req, res) => res.json(await Template.create(req.body)));

app.get('/api/students-list', adminAuth, async (req, res) => {
  const depts = await Dept.find(); const students = await Student.find(); const deptStudents = await DeptStudent.find();
  const resData = depts.map(d => ({
    id: d._id, name: d.name,
    students: students.filter(s => deptStudents.some(ds => ds.departmentId === d._id.toString() && ds.studentId === s._id.toString())).map(s => ({ id: s._id, name: s.name, universityId: s.universityId, rooms: '' }))
  }));
  res.json(resData);
});

app.post('/api/departments/:id/students', adminAuth, async (req, res) => {
  let s = await Student.findOne({ universityId: req.body.universityId });
  if (!s) s = await Student.create({ name: req.body.name, universityId: req.body.universityId });
  if (!await DeptStudent.findOne({ departmentId: req.params.id, studentId: s._id })) await DeptStudent.create({ departmentId: req.params.id, studentId: s._id });
  res.json({ ok: true });
});

app.post('/api/departments/:id/students/bulk', adminAuth, async (req, res) => {
  for (let std of req.body.students) {
    let s = await Student.findOne({ universityId: std.universityId });
    if (!s) s = await Student.create(std);
    if (!await DeptStudent.findOne({ departmentId: req.params.id, studentId: s._id })) await DeptStudent.create({ departmentId: req.params.id, studentId: s._id });
  }
  res.json({ ok: true });
});

app.delete('/api/students/:id', adminAuth, async (req, res) => {
  await Student.deleteOne({ _id: req.params.id });
  await DeptStudent.deleteMany({ studentId: req.params.id });
  await RoomStudent.deleteMany({ studentId: req.params.id });
  await Attempt.deleteMany({ studentId: req.params.id });
  res.json({ ok: true });
});

app.get('/api/rooms', adminAuth, async (req, res) => {
  await updateScheduledRooms();
  const rooms = await Room.find(); const subs = await Sub.find(); const depts = await Dept.find();
  res.json(rooms.map(r => {
    const sub = subs.find(s => s._id.toString() === r.subjectId) || {};
    const dept = depts.find(d => d._id.toString() === sub.departmentId) || {};
    return { ...r._doc, id: r._id, subjectName: sub.name, departmentName: dept.name };
  }));
});

app.post('/api/rooms', adminAuth, async (req, res) => {
  const room = await Room.create({ ...req.body, status: 'draft', isOpen: false, isGradesPublished: false, questions: [] });
  res.json(room);
});

app.post('/api/rooms/:id/duplicate', adminAuth, async (req, res) => {
  const original = await Room.findById(req.params.id);
  if (original) {
    const copy = original.toObject(); delete copy._id;
    copy.name = original.name + ' (نسخة)'; copy.status = 'draft'; copy.isOpen = false; copy.isGradesPublished = false;
    copy.questions.forEach(q => q.id = Math.random().toString());
    res.json(await Room.create(copy));
  }
});

app.put('/api/rooms/:id', adminAuth, async (req, res) => {
  res.json(await Room.findByIdAndUpdate(req.params.id, req.body, { new: true }));
});

app.delete('/api/rooms/:id', adminAuth, async (req, res) => {
  await Room.deleteOne({ _id: req.params.id });
  await RoomStudent.deleteMany({ roomId: req.params.id });
  await Attempt.deleteMany({ roomId: req.params.id });
  res.json({ ok: true });
});

app.post('/api/rooms/:id/questions', adminAuth, async (req, res) => {
  const room = await Room.findById(req.params.id);
  if (room) { room.questions.push(...req.body.questions); await room.save(); res.json(room); }
});

app.put('/api/rooms/:id/questions/reorder', adminAuth, async (req, res) => {
  const room = await Room.findById(req.params.id);
  if (!room) return res.status(404).json({ error: 'القاعة غير موجودة' });
  if (!Array.isArray(req.body.questions)) return res.status(400).json({ error: 'ترتيب الأسئلة غير صالح' });
  room.questions = req.body.questions;
  await room.save();
  res.json(room);
});

app.put('/api/rooms/:id/questions/:qid', adminAuth, async (req, res) => {
  const room = await Room.findById(req.params.id);
  if (room) {
    const q = room.questions.find(x => x.id === req.params.qid);
    if (q) { Object.assign(q, req.body); await room.save(); }
    res.json(room);
  }
});

app.delete('/api/rooms/:id/questions/:qid', adminAuth, async (req, res) => {
  const room = await Room.findById(req.params.id);
  if (room) { room.questions = room.questions.filter(x => x.id !== req.params.qid); await room.save(); res.json(room); }
});

app.get('/api/rooms/:id/students', adminAuth, async (req, res) => {
  const rs = await RoomStudent.find({ roomId: req.params.id });
  const students = await Student.find({ _id: { $in: rs.map(r => r.studentId) } });
  res.json(students.map(s => ({ ...s._doc, id: s._id })));
});

app.post('/api/rooms/:id/students', adminAuth, async (req, res) => {
  for (let std of req.body.students) {
    let s = await Student.findOne({ universityId: std.universityId });
    if (!s) s = await Student.create(std);
    if (!await RoomStudent.findOne({ roomId: req.params.id, studentId: s._id })) await RoomStudent.create({ roomId: req.params.id, studentId: s._id });
  }
  res.json({ ok: true });
});

app.delete('/api/rooms/:id/students/:sid', adminAuth, async (req, res) => {
  await RoomStudent.deleteMany({ roomId: req.params.id, studentId: req.params.sid });
  await Attempt.deleteMany({ roomId: req.params.id, studentId: req.params.sid });
  res.json({ ok: true });
});

app.get('/api/rooms/:id/reports', adminAuth, async (req, res) => {
  const attempts = await Attempt.find({ roomId: req.params.id });
  const students = await Student.find({ _id: { $in: attempts.map(a => a.studentId) } });
  res.json(attempts.map(a => ({ ...a._doc, student: students.find(s => s._id.toString() === a.studentId) })));
});

app.post('/api/rooms/:id/open', adminAuth, async (req, res) => {
  res.json(await Room.findByIdAndUpdate(req.params.id, { isOpen: true, status: 'active' }, { new: true }));
});

app.post('/api/rooms/:id/close', adminAuth, async (req, res) => {
  res.json(await Room.findByIdAndUpdate(req.params.id, { isOpen: false, status: 'closed' }, { new: true }));
});

// ===== Student Routes =====
async function updateScheduledRooms() {
  if (mongoose.connection.readyState !== 1) return;
  const now = new Date();
  await Room.updateMany(
    { scheduledOpenAt: { $lte: now }, isOpen: false, status: { $ne: 'closed' } },
    { $set: { isOpen: true, status: 'active' } }
  );
  await Room.updateMany(
    { scheduledCloseAt: { $lte: now }, isOpen: true },
    { $set: { isOpen: false, status: 'closed' } }
  );
}

setInterval(() => updateScheduledRooms().catch(err => console.error('Schedule update failed:', err)), 30000);

app.post('/api/attempts/start', auth, async (req, res) => {
  await updateScheduledRooms();
  const room = await Room.findById(req.body.roomId);
  if (!room || !room.isOpen) return res.status(403).json({ error: 'القاعة مغلقة' });
  if (room.pin && room.pin !== req.body.pin) return res.status(401).json({ error: 'الرمز السري غير صحيح' });
  let attempt = await Attempt.findOne({ roomId: room._id, studentId: req.user.id, submittedAt: null });
  if (!attempt) attempt = await Attempt.create({ roomId: room._id, studentId: req.user.id, answers: {}, violations: [] });
  res.json({ attempt, room });
});

app.post('/api/attempts/:id/answer', auth, async (req, res) => {
  const attempt = await Attempt.findById(req.params.id);
  if (attempt) { attempt.answers[req.body.qId] = req.body.cId; await attempt.save(); }
  res.json({ ok: true });
});

app.post('/api/attempts/:id/violation', auth, async (req, res) => {
  const attempt = await Attempt.findById(req.params.id);
  if (attempt) {
    let imgPath = null;
    if (req.body.image) {
      const fileName = `v_${attempt._id}_${Date.now()}.jpg`;
      fs.writeFileSync(path.join(UPLOADS_DIR, fileName), req.body.image.replace(/^data:image\/jpeg;base64,/, ""), 'base64');
      imgPath = `/uploads/${fileName}`;
    }
    attempt.violations.push({ type: req.body.type, time: Date.now(), imagePath: imgPath });
    await attempt.save();
  }
  res.json({ ok: true });
});

app.post('/api/attempts/:id/submit', auth, async (req, res) => {
  const attempt = await Attempt.findById(req.params.id);
  if (attempt) {
    attempt.submittedAt = new Date();
    const room = await Room.findById(attempt.roomId);
    let score = 0;
    room.questions.forEach(q => {
      if (q.type !== 'essay' && attempt.answers[q.id] === q.choices.find(c => c.isCorrect)?.id) score += q.points || 1;
    });
    attempt.score = score; attempt.total = room.questions.reduce((s, q) => s + (q.points || 1), 0);
    await attempt.save();
    res.json({ ok: true, score, total: attempt.total, allowReview: room.isGradesPublished && room.protection?.allowReview });
  }
});

// ===== Start =====
const PORT = process.env.PORT || 4000;
app.use(express.static(path.join(__dirname, '../')));
app.get('*', (req, res) => res.sendFile(path.join(__dirname, '../index.html')));
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
