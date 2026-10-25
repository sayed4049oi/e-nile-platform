import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  await prisma.admin.upsert({
    where: { username: 'admin' },
    update: {},
    create: {
      username: 'admin',
      password: await bcrypt.hash('admin123', 10),
      name: 'مدير النظام',
    },
  });

  const s = await prisma.student.upsert({
    where: { universityId: '2024001' },
    update: {},
    create: { name: 'أحمد محمد', universityId: '2024001' },
  });

  const r = await prisma.room.upsert({
    where: { id: 'room-cs-2' },
    update: {},
    create: {
      id: 'room-cs-2',
      name: 'قاعة علوم حاسوب - سنة ثانية - مادة برمجة',
      durationMin: 60,
    },
  });

  await prisma.roomStudent.upsert({
    where: { roomId_studentId: { roomId: r.id, studentId: s.id } },
    update: {},
    create: { roomId: r.id, studentId: s.id },
  });

  if ((await prisma.question.count({ where: { roomId: r.id } })) === 0) {
    const QS = [
      {
        text: 'ما ناتج 2 + 2؟',
        choices: [
          { text: '3', isCorrect: false },
          { text: '4', isCorrect: true },
          { text: '5', isCorrect: false },
        ],
      },
      {
        text: 'أي مما يلي لغة برمجة؟',
        choices: [
          { text: 'HTML', isCorrect: false },
          { text: 'Python', isCorrect: true },
          { text: 'HTTP', isCorrect: false },
        ],
      },
    ];
    for (let i = 0; i < QS.length; i++) {
      const q = QS[i];
      await prisma.question.create({
        data: {
          roomId: r.id,
          text: q.text,
          points: 1,
          position: i,
          choices: {
            create: q.choices.map((c, idx) => ({
              text: c.text, isCorrect: c.isCorrect, position: idx,
            })),
          },
        },
      });
    }
  }

  console.log('Seed done: admin/admin123, student 2024001');
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
