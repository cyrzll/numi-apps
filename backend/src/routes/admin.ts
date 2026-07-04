import { Hono } from 'hono';
import { authMiddleware } from '../middleware/auth.js';
import { UserRepository, KancilRepository, ProgressRepository, QuizRepository } from '../repositories/index.js';
import { notifyUserStatusUpdate, forceDisconnectUser } from '../ws/websocket.js';

const router = new Hono<{ Variables: { userId: string; username: string } }>();

// Protect all admin endpoints with JWT auth
router.use('*', authMiddleware);

// Middleware to verify the user is actually an admin in the DB
const adminGuard = async (c: any, next: any) => {
  const userId = c.get('userId');
  const user = await UserRepository.findById(userId);
  if (!user || user.role !== 'admin') {
    return c.json({ error: 'Akses ditolak! Halaman ini hanya untuk Guru / Admin.' }, 403);
  }
  await next();
};

router.use('*', adminGuard);

// 1. GET ALL USERS (with their Kancil pet and progress info)
router.get('/users', async (c) => {
  try {
    const users = await UserRepository.findAll();
    const usersWithData = await Promise.all(
      users.map(async (u) => {
        const kancil = await KancilRepository.getOrCreate(u.id);
        const progress = await ProgressRepository.getOrCreate(u.id);
        return {
          id: u.id,
          username: u.username,
          role: u.role,
          bannedUntil: u.bannedUntil || null,
          kancil,
          progress
        };
      })
    );
    return c.json({ users: usersWithData });
  } catch (err) {
    console.error('Admin fetch users error:', err);
    return c.json({ error: 'Gagal mengambil data siswa.' }, 500);
  }
});

// 2. REWARD STUDENT (Give manual coins or XP)
router.post('/users/:id/reward', async (c) => {
  try {
    const studentId = c.req.param('id');
    const { coins = 0, xp = 0 } = await c.req.json();

    const addCoins = parseInt(coins, 10) || 0;
    const addXp = parseInt(xp, 10) || 0;

    if (addCoins < 0 || addXp < 0) {
      return c.json({ error: 'Reward tidak boleh bernilai negatif!' }, 400);
    }

    const kancil = await KancilRepository.getOrCreate(studentId);
    
    // Calculate level up (capped at level 20 max)
    let currentXp = kancil.xp + addXp;
    let currentLevel = kancil.level;
    let xpNeeded = currentLevel * 100;
    let didLevelUp = false;

    while (currentXp >= xpNeeded && currentLevel < 20) {
      currentXp -= xpNeeded;
      currentLevel += 1;
      didLevelUp = true;
      xpNeeded = currentLevel * 100;
    }

    if (currentLevel >= 20) {
      currentXp = 0; // lock XP progress bar at max level
    }

    const updates: any = {
      coins: kancil.coins + addCoins,
      xp: currentXp,
      level: currentLevel,
      happiness: Math.min(100, kancil.happiness + 15),
      health: Math.min(100, kancil.health + 5)
    };

    const updatedKancil = await KancilRepository.update(studentId, updates);

    if (didLevelUp) {
      // Check target world
      const progress = await ProgressRepository.getOrCreate(studentId);
      const targetWorldId = currentLevel;
      if (targetWorldId <= 5 && !progress.unlockedWorlds.includes(targetWorldId)) {
        const newUnlockedWorlds = [...progress.unlockedWorlds, targetWorldId].sort();
        await ProgressRepository.update(studentId, {
          unlockedWorlds: newUnlockedWorlds,
          currentWorldId: targetWorldId
        });
      }
    }

    // Push live tick state to user via WebSockets immediately!
    notifyUserStatusUpdate(studentId, updatedKancil);

    return c.json({
      success: true,
      message: `Berhasil memberikan reward! Murid mendapat ${addCoins} koin dan ${addXp} XP.`,
      kancil: updatedKancil
    });

  } catch (err) {
    console.error('Admin reward student error:', err);
    return c.json({ error: 'Gagal memberikan reward ke siswa.' }, 500);
  }
});

// 3. GET ALL QUESTIONS
router.get('/questions', async (c) => {
  try {
    const list = await QuizRepository.getAllQuestions();
    return c.json({ questions: list });
  } catch (err) {
    console.error('Admin fetch questions error:', err);
    return c.json({ error: 'Gagal mengambil data soal kuis.' }, 500);
  }
});

// 4. ADD A NEW QUIZ QUESTION
router.post('/questions', async (c) => {
  try {
    const { subject, questionText, options, correctOptionIndex, rewardCoins, rewardXp } = await c.req.json();

    if (!subject || !questionText || !options || correctOptionIndex === undefined) {
      return c.json({ error: 'Seluruh input soal kuis wajib diisi!' }, 400);
    }

    if (!Array.isArray(options) || options.length !== 4) {
      return c.json({ error: 'Pilihan jawaban wajib berjumlah tepat 4 pilihan!' }, 400);
    }

    const correctIdx = parseInt(correctOptionIndex, 10);
    if (correctIdx < 0 || correctIdx > 3) {
      return c.json({ error: 'Kunci jawaban harus menunjuk ke indeks opsi 0-3!' }, 400);
    }

    const coinsVal = parseInt(rewardCoins, 10) || 10;
    const xpVal = parseInt(rewardXp, 10) || 20;

    const newQuestion = await QuizRepository.addQuestion({
      subject,
      levelMin: 1, // default min level
      questionText,
      options,
      correctOptionIndex: correctIdx,
      rewardCoins: coinsVal,
      rewardXp: xpVal
    });

    return c.json({
      success: true,
      message: 'Soal kuis baru berhasil ditambahkan!',
      question: newQuestion
    });

  } catch (err) {
    console.error('Admin add question error:', err);
    return c.json({ error: 'Gagal menambahkan soal kuis baru.' }, 500);
  }
});

// 5. DELETE A QUIZ QUESTION
router.delete('/questions/:id', async (c) => {
  try {
    const qId = parseInt(c.req.param('id'), 10);
    if (isNaN(qId)) {
      return c.json({ error: 'ID Soal tidak valid!' }, 400);
    }

    await QuizRepository.deleteQuestion(qId);
    return c.json({ success: true, message: 'Soal kuis berhasil dihapus!' });
  } catch (err) {
    console.error('Admin delete question error:', err);
    return c.json({ error: 'Gagal menghapus soal kuis.' }, 500);
  }
});

// 6. BAN A USER
router.post('/users/:id/ban', async (c) => {
  try {
    const studentId = c.req.param('id');
    const { durationValue, durationUnit } = await c.req.json();

    const val = parseInt(durationValue, 10);
    if (isNaN(val) || val <= 0) {
      return c.json({ error: 'Durasi ban harus berupa angka positif!' }, 400);
    }

    const user = await UserRepository.findById(studentId);
    if (!user) {
      return c.json({ error: 'User tidak ditemukan!' }, 404);
    }

    if (user.role === 'admin') {
      return c.json({ error: 'Tidak dapat membanned sesama akun Admin/Guru!' }, 400);
    }

    let bannedUntil = new Date();
    if (durationUnit === 'minutes') {
      bannedUntil.setMinutes(bannedUntil.getMinutes() + val);
    } else if (durationUnit === 'hours') {
      bannedUntil.setHours(bannedUntil.getHours() + val);
    } else if (durationUnit === 'days') {
      bannedUntil.setDate(bannedUntil.getDate() + val);
    } else {
      return c.json({ error: 'Satuan durasi tidak valid! Gunakan minutes, hours, atau days.' }, 400);
    }

    await UserRepository.updateBan(studentId, bannedUntil);
    
    // Kick user out of active WebSocket session instantly
    forceDisconnectUser(studentId);

    const formatEnd = bannedUntil.toLocaleString('id-ID');
    return c.json({
      success: true,
      message: `User ${user.username} berhasil dibanned selama ${val} ${durationUnit} (sampai ${formatEnd})`,
      bannedUntil
    });
  } catch (err) {
    console.error('Admin ban user error:', err);
    return c.json({ error: 'Gagal membanned user.' }, 500);
  }
});

// 7. UNBAN A USER
router.post('/users/:id/unban', async (c) => {
  try {
    const studentId = c.req.param('id');
    const user = await UserRepository.findById(studentId);
    if (!user) {
      return c.json({ error: 'User tidak ditemukan!' }, 404);
    }

    await UserRepository.updateBan(studentId, null);

    return c.json({
      success: true,
      message: `User ${user.username} berhasil diunban!`
    });
  } catch (err) {
    console.error('Admin unban user error:', err);
    return c.json({ error: 'Gagal membatalkan ban user.' }, 500);
  }
});

export default router;
