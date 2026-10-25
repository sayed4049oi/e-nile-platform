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
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('✅ Connected to MongoDB Atlas successfully!'))
  .catch((err) => console.error('❌ MongoDB connection error:', err));

// ===== Models =====
const Admin = mongoose.model('Admin', new mongoose.Schema({ username: String, password: String, name: String, isSuper: Boolean }));
const Dept = mongoose.model('Dept', new mongoose.Schema({ name: String }));
const Sub = mongoose.model('Sub', new mongoose.Schema({ departmentId: String, name: String }));
const Template = mongoose.model('Template', new mongoose.Schema({ name: String, durationMin: Number, protection: Object }));
const Room = mongoose.model('Room', new mongoose.Schema({ subjectId: String, name: String, durationMin: Number, pin: String, status: String, isGradesPublished: Boolean, isOpen: Boolean, questions: Array, protection: Object }));
const Student = mongoose.model('Student', new mongoose.Schema({ name: String, universityId: String }));
const DeptStudent = mongoose.model('DeptStudent', new mongoose.Schema({ departmentId: String, studentId: String }));
const RoomStudent = mongoose.model('RoomStudent', new mongoose.Schema({ roomId: String, studentId: String }));
const Attempt = mongoose.model('Attempt', new mongoose.Schema({ roomId: String, studentId: String, answers: Object, violations: Array, submittedAt: Date, score: Number, total: Number }));

const JWT_SECRET = process.env.JWT_SECRET || 'secret';
const uuid = () => crypto.randomUUID();

// ===== Middlewares =====
const auth = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'غير مصرح' });
  try { req.user = jwt.verify(token, JWT_SECRET); next(); } catch { res.status(401).json({ error: 'انتهت' }); }
};

// ===== Auth =====
app.post('/api/auth/admin/login', async (req, res) => {
  const admin = await Admin.findOne({ username: req.body.username });
  if (!admin || !(await bcrypt.compare(req.body.password, admin.password))) return res.status(401).json({ error: 'بيانات خاطئة' });
  const token = jwt.sign({ id: admin._id, role: 'admin' }, JWT_SECRET, { expiresIn: '12h' });
  res.json({ token, admin: { name: admin.name, isSuper: admin.isSuper } });
});

app.post('/api/auth/student/enter', async (req, res) => {
  const student = await Student.findOne({ universityId: req.body.universityId });
  if (!student) return res.status(404).json({ error: 'الرقم غير مسجل' });
  const enrolled = await RoomStudent.find({ studentId: student._id });
  const rooms = await Room.find({ _id: { $in: enrolled.map(e => e.roomId) }, isOpen: true });
  const token = jwt.sign({ id: student._id, role: 'student' }, JWT_SECRET, { expiresIn: '4h' });
  res.json({ token, student, rooms });
});

// ===== Admin Routes =====
app.get('/api/system/backup', auth, async (req, res) => {
  const data = { admins: await Admin.find(), departments: await Dept.find(), subjects: await Sub.find(), rooms: await Room.find(), students: await Student.find(), attempts: await Attempt.find() };
  res.header('Content-Disposition', 'attachment; filename="e-nile-backup.json"');
  res.send(JSON.stringify(data, null, 2));
});

app.post('/api/system/reset', auth, async (req, res) => {
  await Dept.deleteMany({}); await Sub.deleteMany({}); await Room.deleteMany({}); await Student.deleteMany({}); await DeptStudent.deleteMany({}); await RoomStudent.deleteMany({}); await Attempt.deleteMany({}); await Template.deleteMany({});
  res.json({ ok: true });
});

app.get('/api/departments', auth, async (req, res) => res.json(await Dept.find()));
app.post('/api/departments', auth, async (req, res) => res.json(await Dept.create({ name: req.body.name })));
app.delete('/api/departments/:id', auth, async (req, res) => {
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

app.get('/api/subjects', auth, async (req, res) => res.json(await Sub.find()));
app.post('/api/subjects', auth, async (req, res) => res.json(await Sub.create(req.body)));
app.delete('/api/subjects/:id', auth, async (req, res) => {
  const subId = req.params.id;
  const rooms = await Room.find({ subjectId: subId });
  const roomIds = rooms.map(r => r._id.toString());
  await Room.deleteMany({ subjectId: subId });
  await RoomStudent.deleteMany({ roomId: { $in: roomIds } });
  await Attempt.deleteMany({ roomId: { $in: roomIds } });
  await Sub.deleteOne({ _id: subId });
  res.json({ ok: true });
});

app.get('/api/templates', auth, async (req, res) => res.json(await Template.find()));
app.post('/api/templates', auth, async (req, res) => res.json(await Template.create(req.body)));

app.get('/api/students-list', auth, async (req, res) => {
  const depts = await Dept.find(); const students = await Student.find(); const deptStudents = await DeptStudent.find();
  const resData = depts.map(d => ({
    id: d._id, name: d.name,
    students: students.filter(s => deptStudents.some(ds => ds.departmentId === d._id.toString() && ds.studentId === s._id.toString())).map(s => ({ id: s._id, name: s.name, universityId: s.universityId, rooms: '' }))
  }));
  res.json(resData);
});

app.post('/api/departments/:id/students', auth, async (req, res) => {
  let s = await Student.findOne({ universityId: req.body.universityId });
  if (!s) s = await Student.create({ name: req.body.name, universityId: req.body.universityId });
  if (!await DeptStudent.findOne({ departmentId: req.params.id, studentId: s._id })) await DeptStudent.create({ departmentId: req.params.id, studentId: s._id });
  res.json({ ok: true });
});

app.post('/api/departments/:id/students/bulk', auth, async (req, res) => {
  for (let std of req.body.students) {
    let s = await Student.findOne({ universityId: std.universityId });
    if (!s) s = await Student.create(std);
    if (!await DeptStudent.findOne({ departmentId: req.params.id, studentId: s._id })) await DeptStudent.create({ departmentId: req.params.id, studentId: s._id });
  }
  res.json({ ok: true });
});

app.delete('/api/students/:id', auth, async (req, res) => {
  await Student.deleteOne({ _id: req.params.id });
  await DeptStudent.deleteMany({ studentId: req.params.id });
  await RoomStudent.deleteMany({ studentId: req.params.id });
  await Attempt.deleteMany({ studentId: req.params.id });
  res.json({ ok: true });
});

app.get('/api/rooms', auth, async (req, res) => {
  const rooms = await Room.find(); const subs = await Sub.find(); const depts = await Dept.find();
  res.json(rooms.map(r => {
    const sub = subs.find(s => s._id.toString() === r.subjectId) || {};
    const dept = depts.find(d => d._id.toString() === sub.departmentId) || {};
    return { ...r._doc, id: r._id, subjectName: sub.name, departmentName: dept.name };
  }));
});

app.post('/api/rooms', auth, async (req, res) => {
  const room = await Room.create({ ...req.body, status: 'draft', isOpen: false, isGradesPublished: false, questions: [] });
  res.json(room);
});

app.post('/api/rooms/:id/duplicate', auth, async (req, res) => {
  const original = await Room.findById(req.params.id);
  if (original) {
    const copy = original.toObject(); delete copy._id;
    copy.name = original.name + ' (نسخة)'; copy.status = 'draft'; copy.isOpen = false; copy.isGradesPublished = false;
    copy.questions.forEach(q => q.id = Math.random().toString());
    res.json(await Room.create(copy));
  }
});

app.put('/api/rooms/:id', auth, async (req, res) => {
  res.json(await Room.findByIdAndUpdate(req.params.id, req.body, { new: true }));
});

app.delete('/api/rooms/:id', auth, async (req, res) => {
  await Room.deleteOne({ _id: req.params.id });
  await RoomStudent.deleteMany({ roomId: req.params.id });
  await Attempt.deleteMany({ roomId: req.params.id });
  res.json({ ok: true });
});

app.post('/api/rooms/:id/questions', auth, async (req, res) => {
  const room = await Room.findById(req.params.id);
  if (room) { room.questions.push(...req.body.questions); await room.save(); res.json(room); }
});

app.put('/api/rooms/:id/questions/:qid', auth, async (req, res) => {
  const room = await Room.findById(req.params.id);
  if (room) {
    const q = room.questions.find(x => x.id === req.params.qid);
    if (q) { Object.assign(q, req.body); await room.save(); }
    res.json(room);
  }
});

app.delete('/api/rooms/:id/questions/:qid', auth, async (req, res) => {
  const room = await Room.findById(req.params.id);
  if (room) { room.questions = room.questions.filter(x => x.id !== req.params.qid); await room.save(); res.json(room); }
});

app.get('/api/rooms/:id/students', auth, async (req, res) => {
  const rs = await RoomStudent.find({ roomId: req.params.id });
  const students = await Student.find({ _id: { $in: rs.map(r => r.studentId) } });
  res.json(students.map(s => ({ ...s._doc, id: s._id })));
});

app.post('/api/rooms/:id/students', auth, async (req, res) => {
  for (let std of req.body.students) {
    let s = await Student.findOne({ universityId: std.universityId });
    if (!s) s = await Student.create(std);
    if (!await RoomStudent.findOne({ roomId: req.params.id, studentId: s._id })) await RoomStudent.create({ roomId: req.params.id, studentId: s._id });
  }
  res.json({ ok: true });
});

app.delete('/api/rooms/:id/students/:sid', auth, async (req, res) => {
  await RoomStudent.deleteMany({ roomId: req.params.id, studentId: req.params.sid });
  await Attempt.deleteMany({ roomId: req.params.id, studentId: req.params.sid });
  res.json({ ok: true });
});

app.get('/api/rooms/:id/reports', auth, async (req, res) => {
  const attempts = await Attempt.find({ roomId: req.params.id });
  const students = await Student.find({ _id: { $in: attempts.map(a => a.studentId) } });
  res.json(attempts.map(a => ({ ...a._doc, student: students.find(s => s._id.toString() === a.studentId) })));
});

app.post('/api/rooms/:id/open', auth, async (req, res) => {
  res.json(await Room.findByIdAndUpdate(req.params.id, { isOpen: true, status: 'active' }, { new: true }));
});

app.post('/api/rooms/:id/close', auth, async (req, res) => {
  res.json(await Room.findByIdAndUpdate(req.params.id, { isOpen: false, status: 'closed' }, { new: true }));
});

// ===== Student Routes =====
app.post('/api/attempts/start', auth, async (req, res) => {
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
// كود إضافة الأدمن تلقائياً
async function seedAdmin() {
  const count = await Admin.countDocuments();
  if (count === 0) {
    await Admin.create({
      username: 'admin',
      password: await bcrypt.hash('admin123', 10),
      name: 'المدير العام',
      isSuper: true
    });
    console.log('✅ Default admin created: admin / admin123');
  }
}
seedAdmin();
app.use(express.static(path.join(__dirname, '../')));
app.get('*', (req, res) => res.sendFile(path.join(__dirname, '../index.html')));
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
