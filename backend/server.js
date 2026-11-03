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
const AuditEvent = mongoose.model('AuditEvent', new mongoose.Schema({
  actorId: String,
  actorRole: String,
  action: { type: String, required: true },
  resource: String,
  resourceId: String,
  metadata: Object,
  ip: String,
  createdAt: { type: Date, default: Date.now }
}));
AuditEvent.collection.createIndex({ createdAt: -1 }).catch(() => {});
AuditEvent.collection.createIndex({ actorId: 1, createdAt: -1 }).catch(() => {});
const AiConfig = mongoose.model('AiConfig', new mongoose.Schema({
  mode: { type: String, enum: ['single', 'all'], default: 'single' },
  providers: [{
    id: { type: String, required: true },
    name: { type: String, required: true },
    protocol: { type: String, enum: ['openai', 'anthropic'], default: 'openai' },
    baseUrl: String,
    model: String,
    encryptedKey: String,
    last4: String,
    enabled: { type: Boolean, default: true },
    updatedAt: Date
  }]
}));

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) throw new Error('JWT_SECRET غير مضبوط في الخادم');
const uuid = () => crypto.randomUUID();
const ENCRYPTION_KEY = process.env.APP_ENCRYPTION_KEY;

function encryptionKey() {
  if (!ENCRYPTION_KEY) throw new Error('APP_ENCRYPTION_KEY غير مضبوط في الخادم');
  return crypto.createHash('sha256').update(ENCRYPTION_KEY).digest();
}

function encryptSecret(value) {
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv('aes-256-gcm', encryptionKey(), iv);
  const encrypted = Buffer.concat([cipher.update(value, 'utf8'), cipher.final()]);
  return [iv.toString('base64url'), cipher.getAuthTag().toString('base64url'), encrypted.toString('base64url')].join('.');
}

function decryptSecret(value) {
  const [iv, tag, encrypted] = String(value).split('.');
  const decipher = crypto.createDecipheriv('aes-256-gcm', encryptionKey(), Buffer.from(iv, 'base64url'));
  decipher.setAuthTag(Buffer.from(tag, 'base64url'));
  return Buffer.concat([decipher.update(Buffer.from(encrypted, 'base64url')), decipher.final()]).toString('utf8');
}

function validateProviderUrl(value) {
  let url;
  try { url = new URL(value); } catch { throw new Error('عنوان API غير صالح'); }
  const localHost = /^(localhost|127(?:\.\d{1,3}){3}|0\.0\.0\.0|::1)$/i.test(url.hostname);
  if (url.protocol !== 'https:' && !(process.env.NODE_ENV !== 'production' && url.protocol === 'http:' && localHost)) {
    throw new Error('عنوان API يجب أن يستخدم HTTPS');
  }
  if (url.username || url.password || (!localHost && /^(10\.|192\.168\.|172\.(1[6-9]|2\d|3[01])\.|169\.254\.)/.test(url.hostname))) {
    throw new Error('عنوان API داخلي أو يحتوي بيانات اعتماد غير مسموح');
  }
  return url.toString().replace(/\/+$/, '');
}

async function fetchWithTimeout(url, options = {}, timeoutMs = 30000) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try { return await fetch(url, { ...options, signal: controller.signal }); }
  finally { clearTimeout(timer); }
}

function audit(req, action, resource, resourceId, metadata = {}) {
  return AuditEvent.create({
    actorId: req.user?.id || 'anonymous',
    actorRole: req.user?.role || 'anonymous',
    action, resource, resourceId: resourceId ? String(resourceId) : undefined,
    metadata, ip: req.ip
  }).catch(error => console.error('Audit event failed:', error.message));
}

function requireRole(role) {
  return (req, res, next) => {
    if (req.user?.role !== role) return res.status(403).json({ error: 'صلاحية غير كافية' });
    next();
  };
}

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
const superAdminAuth = (req, res, next) => {
  adminAuth(req, res, async () => {
    const admin = await Admin.findById(req.user.id).select('isSuper');
    if (!admin?.isSuper) return res.status(403).json({ error: 'صلاحية المدير العام مطلوبة' });
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
  const stored = await AiConfig.findOne().lean();
  const configuredProviders = (stored?.providers || []).filter(item => item.enabled !== false && item.encryptedKey);
  if (!configuredProviders.length) throw new Error('أضف مفتاح API واحداً على الأقل من إعدادات النظام');
  const selectedProviders = provider
    ? configuredProviders.filter(item => item.id === provider)
    : stored?.mode === 'all' ? configuredProviders : configuredProviders.slice(0, 1);
  if (!selectedProviders.length) throw new Error('مزود الذكاء الاصطناعي المحدد غير متاح');
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
  const generateForProvider = async (selectedProvider, providerCount) => {
    const apiKey = decryptSecret(selectedProvider.encryptedKey);
    const protocol = selectedProvider.protocol || 'openai';
    const baseUrl = validateProviderUrl(selectedProvider.baseUrl || (protocol === 'anthropic' ? 'https://api.anthropic.com/v1' : 'https://api.openai.com/v1'));
    const selectedModel = model || selectedProvider.model || await discoverModel({ protocol, baseUrl, apiKey });
    const requestPrompt = prompt.replace(`exactly ${count}`, `exactly ${providerCount}`);
    const response = protocol === 'anthropic'
      ? await fetchWithTimeout(`${baseUrl}/messages`, {
        method: 'POST',
        headers: { 'x-api-key': apiKey, 'anthropic-version': '2023-06-01', 'Content-Type': 'application/json' },
        body: JSON.stringify({ model: selectedModel, max_tokens: 4096, temperature: 0.2, system: 'Return JSON only.', messages: [{ role: 'user', content: requestPrompt }] })
      })
      : await fetchWithTimeout(`${baseUrl}/chat/completions`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ model: selectedModel, temperature: 0.2, messages: [{ role: 'system', content: 'Return JSON only.' }, { role: 'user', content: requestPrompt }] })
      });
    const body = await response.json();
    if (!response.ok) throw new Error(body.error?.message || `فشل الاتصال بالمزود ${selectedProvider.name}`);
    const text = protocol === 'anthropic'
      ? body.content?.map(item => item.text || '').join('')
      : body.choices?.[0]?.message?.content;
    return normalizeQuestions(extractJson(text || ''), providerCount);
  };
  const providerCount = Math.max(1, Math.ceil(count / selectedProviders.length));
  const results = await Promise.allSettled(selectedProviders.map(item => generateForProvider(item, providerCount)));
  const batches = results.filter(result => result.status === 'fulfilled').map(result => result.value);
  if (!batches.length) throw new Error(results.find(result => result.status === 'rejected')?.reason?.message || 'تعذر الاتصال بمزودي الذكاء الاصطناعي');
  return batches.flat().slice(0, count);
}

async function discoverModel({ protocol, baseUrl, apiKey }) {
  if (protocol === 'anthropic') throw new Error('حدد موديل Anthropic يدويًا لأن هذا المزود لا يوفر اكتشاف موديلات عامًا');
  if (!apiKey) throw new Error('أضف مفتاح API أو حدد الموديل يدويًا');
  const response = await fetchWithTimeout(`${baseUrl}/models`, { headers: { Authorization: `Bearer ${apiKey}` } });
  if (!response.ok) throw new Error('تعذر اكتشاف موديل مزود الذكاء الاصطناعي');
  const body = await response.json();
  const models = (body.data || []).map(item => item.id).filter(Boolean);
  if (!models.length) throw new Error('لم يُرجع المزود أي موديلات متاحة');
  return models.find(item => /flash|mini|chat|instruct|latest/i.test(item)) || models[0];
}

// ===== Auth =====
app.post('/api/auth/admin/login', async (req, res) => {
  const admin = await Admin.findOne({ username: req.body.username });
  if (!admin || !(await bcrypt.compare(req.body.password, admin.password))) return res.status(401).json({ error: 'بيانات خاطئة' });
  const token = jwt.sign({ id: admin._id, role: 'admin' }, JWT_SECRET, { expiresIn: '12h' });
  const response = { token, admin: { id: admin._id, name: admin.name, isSuper: admin.isSuper } };
  await audit({ user: { id: admin._id, role: 'admin' }, ip: req.ip }, 'login', 'admin', admin._id, { success: true });
  res.json(response);
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

app.get('/api/ai/config', superAdminAuth, async (_req, res) => {
  const stored = await AiConfig.findOne().lean();
  const providers = (stored?.providers || []).map(item => ({
    id: item.id, name: item.name, protocol: item.protocol || 'openai', baseUrl: item.baseUrl,
    model: item.model || null, configured: Boolean(item.encryptedKey), last4: item.last4 || null,
    enabled: item.enabled !== false
  }));
  res.json({
    mode: stored?.mode || 'single',
    configured: providers.some(item => item.configured),
    providers
  });

  app.get('/api/audit-events', superAdminAuth, async (req, res) => {
    const limit = Math.min(200, Math.max(1, Number(req.query.limit) || 50));
    const events = await AuditEvent.find().sort({ createdAt: -1 }).limit(limit).lean();
    res.json(events);
  });
});

app.put('/api/ai/config', superAdminAuth, async (req, res) => {
  try {
    const id = String(req.body.id || crypto.randomUUID()).trim();
    const name = String(req.body.name || '').trim();
    const protocol = req.body.protocol === 'anthropic' ? 'anthropic' : 'openai';
    const baseUrl = validateProviderUrl(String(req.body.baseUrl || '').trim());
    const model = String(req.body.model || '').trim();
    const apiKey = String(req.body.apiKey || '').trim();
    if (!name) return res.status(400).json({ error: 'اسم المزود مطلوب' });
    if (!baseUrl) return res.status(400).json({ error: 'عنوان API مطلوب' });
    const existing = await AiConfig.findOne().lean();
    const old = existing?.providers?.find(item => item.id === id);
    if (!apiKey && !old?.encryptedKey) {
      return res.status(400).json({ error: 'مفتاح API مطلوب' });
    }
    const item = { id, name, protocol, baseUrl, model: model || old?.model || '', enabled: old?.enabled !== false, updatedAt: new Date() };
    if (apiKey) {
      item.encryptedKey = encryptSecret(apiKey);
      item.last4 = apiKey.slice(-4);
    } else {
      item.encryptedKey = old.encryptedKey;
      item.last4 = old.last4;
    }
    const providers = (existing?.providers || []).filter(entry => entry.id !== id);
    providers.push(item);
    await AiConfig.findOneAndUpdate({}, { $set: { providers } }, { upsert: true, new: true });
    await audit(req, 'upsert', 'ai_provider', id, { name, protocol, model: item.model || null });
    res.json({ ok: true, id, model: item.model || null, last4: item.last4 });
  } catch (error) {
    console.error('AI config save failed:', error);
    res.status(500).json({ error: error.message || 'تعذر حفظ إعدادات الذكاء الاصطناعي' });
  }
});

app.put('/api/ai/mode', superAdminAuth, async (req, res) => {
  const mode = req.body.mode === 'all' ? 'all' : 'single';
  await AiConfig.findOneAndUpdate({}, { $set: { mode } }, { upsert: true });
  await audit(req, 'update_mode', 'ai_config', undefined, { mode });
  res.json({ ok: true, mode });
});

app.patch('/api/ai/config/:provider', superAdminAuth, async (req, res) => {
  const enabled = req.body.enabled === true;
  const config = await AiConfig.findOne();
  const provider = config?.providers?.find(item => item.id === req.params.provider);
  if (!provider) return res.status(404).json({ error: 'المزود غير موجود' });
  provider.enabled = enabled;
  await config.save();
  await audit(req, enabled ? 'enable' : 'disable', 'ai_provider', provider.id);
  res.json({ ok: true, id: provider.id, enabled: provider.enabled });
});

app.post('/api/ai/test/:provider', superAdminAuth, async (req, res) => {
  try {
    const config = await AiConfig.findOne().lean();
    const provider = config?.providers?.find(item => item.id === req.params.provider);
    if (!provider?.encryptedKey) return res.status(404).json({ error: 'المزود أو مفتاحه غير موجود' });
    const apiKey = decryptSecret(provider.encryptedKey);
    const protocol = provider.protocol || 'openai';
    const baseUrl = validateProviderUrl(provider.baseUrl || (protocol === 'anthropic' ? 'https://api.anthropic.com/v1' : 'https://api.openai.com/v1'));
    const model = provider.model || await discoverModel({ protocol, baseUrl, apiKey });
    const response = protocol === 'anthropic'
      ? await fetchWithTimeout(`${baseUrl}/messages`, {
        method: 'POST',
        headers: { 'x-api-key': apiKey, 'anthropic-version': '2023-06-01', 'Content-Type': 'application/json' },
        body: JSON.stringify({ model, max_tokens: 32, messages: [{ role: 'user', content: 'Reply with the single word OK.' }] })
      })
      : await fetchWithTimeout(`${baseUrl}/chat/completions`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ model, max_tokens: 32, messages: [{ role: 'user', content: 'Reply with the single word OK.' }] })
      });
    const body = await response.json();
    if (!response.ok) return res.status(502).json({ error: body.error?.message || 'فشل اختبار الاتصال بالمزود' });
    res.json({ ok: true, provider: provider.name, model });
  } catch (error) {
    console.error('AI provider test failed:', error);
    res.status(502).json({ error: error.message || 'تعذر اختبار المزود' });
  }
});

app.delete('/api/ai/config/:provider', superAdminAuth, async (req, res) => {
  const config = await AiConfig.findOne();
  if (config) {
    config.providers = config.providers.filter(item => item.id !== req.params.provider);
    await config.save();
  }
  await audit(req, 'delete', 'ai_provider', req.params.provider);
  res.json({ ok: true });
});

app.post('/api/ai/generate-questions', adminAuth, async (req, res) => {
  const { provider, model, sourceText, count, type, difficulty, language, existingQuestions, instruction } = req.body;
  const requestedCount = Math.max(1, Math.min(50, Number(count) || 10));
  if (!sourceText || sourceText.trim().length < 30) return res.status(400).json({ error: 'المحتوى المصدر قصير جداً' });
  try {
    const questions = await generateWithAI({ provider, model, sourceText: sourceText.slice(0, 100000), count: requestedCount, type, difficulty, language, existingQuestions, instruction });
    await audit(req, 'generate_questions', 'ai', provider || 'configured', { count: requestedCount, type, language });
    res.json({ questions, provider: provider || null, model: model || null });
  } catch (error) {
    console.error('AI question generation failed:', error);
    res.status(502).json({ error: error.message || 'تعذر إنشاء الأسئلة' });
  }
});

// ===== Admin Management =====
app.get('/api/admins', superAdminAuth, async (req, res) => {
  const admins = await Admin.find().select('-password').sort({ name: 1 });
  res.json(admins.map(a => ({ ...a._doc, id: a._id })));
});

app.post('/api/admins', superAdminAuth, async (req, res) => {
  const { username, password, name } = req.body;
  if (!username || !password || !name) return res.status(400).json({ error: 'جميع البيانات مطلوبة' });
  if (await Admin.exists({ username })) return res.status(409).json({ error: 'اسم المستخدم موجود مسبقاً' });
  const admin = await Admin.create({ username, name, password: await bcrypt.hash(password, 10), isSuper: false });
  await audit(req, 'create', 'admin', admin._id, { username, name });
  res.status(201).json({ id: admin._id, name: admin.name, username: admin.username, isSuper: admin.isSuper });
});

app.put('/api/admins/:id', superAdminAuth, async (req, res) => {
  const updates = { name: req.body.name, username: req.body.username };
  if (req.body.password) updates.password = await bcrypt.hash(req.body.password, 10);
  const admin = await Admin.findByIdAndUpdate(req.params.id, updates, { new: true, runValidators: true }).select('-password');
  if (!admin) return res.status(404).json({ error: 'الأدمن غير موجود' });
  await audit(req, 'update', 'admin', admin._id, { username: updates.username, name: updates.name, passwordChanged: Boolean(req.body.password) });
  res.json({ ...admin._doc, id: admin._id });
});

app.delete('/api/admins/:id', superAdminAuth, async (req, res) => {
  const admin = await Admin.findById(req.params.id);
  if (!admin) return res.status(404).json({ error: 'الأدمن غير موجود' });
  if (admin.isSuper) return res.status(403).json({ error: 'لا يمكن حذف المدير العام' });
  await admin.deleteOne();
  await audit(req, 'delete', 'admin', admin._id, { username: admin.username });
  res.json({ ok: true });
});

// ===== Admin Routes =====
app.get('/api/system/backup', adminAuth, async (req, res) => {
  const data = {
    version: 1,
    createdAt: new Date().toISOString(),
    admins: await Admin.find().select('-password').lean(),
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
  await audit(req, 'export', 'system_backup', undefined, { version: data.version });
  res.send(JSON.stringify(data, null, 2));
});

app.post('/api/system/restore', adminAuth, async (req, res) => {
  const backup = req.body;
  const collections = [
    ['departments', Dept], ['subjects', Sub], ['templates', Template],
    ['rooms', Room], ['students', Student], ['departmentStudents', DeptStudent],
    ['roomStudents', RoomStudent], ['attempts', Attempt]
  ];
  if (!backup || collections.some(([key]) => !Array.isArray(backup[key]))) {
    return res.status(400).json({ error: 'ملف النسخة الاحتياطية غير صالح أو ناقص' });
  }
  try {
    for (const [, Model] of collections) await Model.deleteMany({});
    for (const [key, Model] of collections) if (backup[key].length) await Model.insertMany(backup[key], { ordered: true });
    await audit(req, 'restore', 'system_backup', undefined, { version: backup.version });
    res.json({ ok: true });
  } catch (err) {
    console.error('Restore failed:', err);
    res.status(400).json({ error: 'تعذر استرجاع النسخة الاحتياطية' });
  }
});

app.post('/api/system/reset', adminAuth, async (req, res) => {
  await Dept.deleteMany({}); await Sub.deleteMany({}); await Room.deleteMany({}); await Student.deleteMany({}); await DeptStudent.deleteMany({}); await RoomStudent.deleteMany({}); await Attempt.deleteMany({}); await Template.deleteMany({});
  await audit(req, 'reset', 'system');
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
  const room = await Room.findByIdAndUpdate(req.params.id, { isOpen: true, status: 'active' }, { new: true });
  await audit(req, 'open', 'room', req.params.id);
  res.json(room);
});

app.post('/api/rooms/:id/close', adminAuth, async (req, res) => {
  const room = await Room.findByIdAndUpdate(req.params.id, { isOpen: false, status: 'closed' }, { new: true });
  await audit(req, 'close', 'room', req.params.id);
  res.json(room);
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
  if (req.user.role !== 'student') return res.status(403).json({ error: 'هذه العملية للطلاب فقط' });
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
  if (!attempt) return res.status(404).json({ error: 'المحاولة غير موجودة' });
  if (req.user.role !== 'student' || String(attempt.studentId) !== String(req.user.id)) return res.status(403).json({ error: 'لا تملك هذه المحاولة' });
  if (attempt.submittedAt) return res.status(409).json({ error: 'تم تسليم المحاولة' });
  attempt.answers[req.body.qId] = req.body.cId; await attempt.save();
  res.json({ ok: true });
});

app.post('/api/attempts/:id/violation', auth, async (req, res) => {
  const attempt = await Attempt.findById(req.params.id);
  if (!attempt) return res.status(404).json({ error: 'المحاولة غير موجودة' });
  if (req.user.role !== 'student' || String(attempt.studentId) !== String(req.user.id)) return res.status(403).json({ error: 'لا تملك هذه المحاولة' });
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
  if (!attempt) return res.status(404).json({ error: 'المحاولة غير موجودة' });
  if (req.user.role !== 'student' || String(attempt.studentId) !== String(req.user.id)) return res.status(403).json({ error: 'لا تملك هذه المحاولة' });
  if (attempt.submittedAt) return res.status(409).json({ error: 'تم تسليم المحاولة مسبقاً' });
  if (attempt) {
    attempt.submittedAt = new Date();
    const room = await Room.findById(attempt.roomId);
    let score = 0;
    room.questions.forEach(q => {
      if (q.type !== 'essay' && attempt.answers[q.id] === q.choices.find(c => c.isCorrect)?.id) score += q.points || 1;
    });
    attempt.score = score; attempt.total = room.questions.reduce((s, q) => s + (q.points || 1), 0);
    await attempt.save();
    await audit(req, 'submit', 'attempt', attempt._id, { roomId: attempt.roomId });
    res.json({ ok: true, score, total: attempt.total, allowReview: room.isGradesPublished && room.protection?.allowReview });
  }
});

// ===== Start =====
const PORT = process.env.PORT || 4000;
app.use(express.static(path.join(__dirname, '../')));
app.get('*', (req, res) => res.sendFile(path.join(__dirname, '../index.html')));
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
