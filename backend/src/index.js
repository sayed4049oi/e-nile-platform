import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { createServer } from 'http';
import { Server } from 'socket.io';
import authRoutes from './routes/auth.js';
import roomRoutes from './routes/rooms.js';
import questionRoutes from './routes/questions.js';
import attemptRoutes from './routes/attempts.js';
import reportRoutes from './routes/reports.js';

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: { origin: process.env.CLIENT_ORIGIN, credentials: true },
});
app.set('io', io);

app.use(cors({ origin: process.env.CLIENT_ORIGIN, credentials: true }));
app.use(express.json({ limit: '10mb' }));
app.use('/uploads', express.static(process.env.UPLOAD_DIR || './uploads'));

app.use('/api/auth', authRoutes);
app.use('/api/rooms', roomRoutes);
app.use('/api/questions', questionRoutes);
app.use('/api/attempts', attemptRoutes);
app.use('/api/reports', reportRoutes);

app.get('/api/health', (_req, res) => res.json({ ok: true, name: 'E-Nile' }));
app.use((_req, res) => res.status(404).json({ error: 'غير موجود' }));
app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(500).json({ error: 'خطأ في الخادم', detail: err.message });
});

io.on('connection', (s) => {
  s.on('admin:watch-room', (rid) => s.join('room:' + rid));
  s.on('admin:unwatch-room', (rid) => s.leave('room:' + rid));
});

const PORT = process.env.PORT || 4000;
httpServer.listen(PORT, () => console.log('E-Nile running on http://localhost:' + PORT));
