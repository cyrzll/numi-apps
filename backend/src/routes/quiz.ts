import { Hono } from 'hono';
import { authMiddleware } from '../middleware/auth.js';
import { QuizRepository, KancilRepository, ProgressRepository } from '../repositories/index.js';
import cacheService from '../services/cache.js';
import { notifyUserStatusUpdate } from '../ws/websocket.js';

const router = new Hono<{ Variables: { userId: string; username: string } }>();

router.use('*', authMiddleware);

// Define quiz seed data
const SEED_QUESTIONS = [
  // MATEMATIKA
  {
    subject: 'matematika',
    levelMin: 1,
    questionText: 'Berapakah hasil dari 15 + 8?',
    options: ['20', '23', '25', '21'],
    correctOptionIndex: 1,
    rewardCoins: 10,
    rewardXp: 20
  },
  {
    subject: 'matematika',
    levelMin: 1,
    questionText: 'Kancil mempunyai 12 apel. Kancil memberikan 4 apel ke Kerbau. Berapa sisa apel Kancil?',
    options: ['6', '8', '10', '7'],
    correctOptionIndex: 1,
    rewardCoins: 10,
    rewardXp: 20
  },
  {
    subject: 'matematika',
    levelMin: 2,
    questionText: 'Hasil perkalian dari 5 x 6 adalah...',
    options: ['30', '25', '35', '24'],
    correctOptionIndex: 0,
    rewardCoins: 15,
    rewardXp: 25
  },
  {
    subject: 'matematika',
    levelMin: 3,
    questionText: 'Berapa 100 dibagi 4?',
    options: ['20', '30', '25', '15'],
    correctOptionIndex: 2,
    rewardCoins: 20,
    rewardXp: 30
  },

  // IPA
  {
    subject: 'ipa',
    levelMin: 1,
    questionText: 'Hewan apakah yang bernapas menggunakan insang?',
    options: ['Kucing', 'Burung', 'Ikan', 'Kancil'],
    correctOptionIndex: 2,
    rewardCoins: 10,
    rewardXp: 20
  },
  {
    subject: 'ipa',
    levelMin: 1,
    questionText: 'Bagian tumbuhan yang bertugas menyerap air dari dalam tanah adalah...',
    options: ['Daun', 'Akar', 'Batang', 'Bunga'],
    correctOptionIndex: 1,
    rewardCoins: 10,
    rewardXp: 20
  },
  {
    subject: 'ipa',
    levelMin: 2,
    questionText: 'Manakah dari benda berikut yang termasuk benda padat?',
    options: ['Air sirup', 'Batu kali', 'Asap pembakaran', 'Minyak goreng'],
    correctOptionIndex: 1,
    rewardCoins: 12,
    rewardXp: 22
  },

  // IPS
  {
    subject: 'ips',
    levelMin: 1,
    questionText: 'Apakah nama ibukota dari negara Indonesia?',
    options: ['Bandung', 'Surabaya', 'Jakarta', 'Medan'],
    correctOptionIndex: 2,
    rewardCoins: 10,
    rewardXp: 20
  },
  {
    subject: 'ips',
    levelMin: 2,
    questionText: 'Pekerjaan yang menghasilkan barang berupa makanan pokok padi adalah...',
    options: ['Nelayan', 'Petani', 'Guru', 'Dokter'],
    correctOptionIndex: 1,
    rewardCoins: 12,
    rewardXp: 22
  },

  // BAHASA INDONESIA
  {
    subject: 'indonesia',
    levelMin: 1,
    questionText: 'Kata tanya yang digunakan untuk menanyakan tempat adalah...',
    options: ['Siapa', 'Mengapa', 'Di mana', 'Kapan'],
    correctOptionIndex: 2,
    rewardCoins: 10,
    rewardXp: 20
  },
  {
    subject: 'indonesia',
    levelMin: 1,
    questionText: 'Lawan kata dari "Rajin" adalah...',
    options: ['Pintar', 'Malas', 'Baik', 'Sombong'],
    correctOptionIndex: 1,
    rewardCoins: 10,
    rewardXp: 20
  },

  // BAHASA INGGRIS DASAR
  {
    subject: 'english',
    levelMin: 1,
    questionText: 'Bahasa Inggris dari buah "Apel" adalah...',
    options: ['Banana', 'Grape', 'Apple', 'Orange'],
    correctOptionIndex: 2,
    rewardCoins: 10,
    rewardXp: 20
  },
  {
    subject: 'english',
    levelMin: 1,
    questionText: 'What is the color of the sun?',
    options: ['Yellow', 'Green', 'Blue', 'Purple'],
    correctOptionIndex: 0,
    rewardCoins: 12,
    rewardXp: 22
  },

  // PENDIDIKAN PANCASILA
  {
    subject: 'pancasila',
    levelMin: 1,
    questionText: 'Lambang sila pertama Pancasila adalah...',
    options: ['Bintang', 'Rantai', 'Pohon Beringin', 'Kepala Banteng'],
    correctOptionIndex: 0,
    rewardCoins: 10,
    rewardXp: 20
  },
  {
    subject: 'pancasila',
    levelMin: 2,
    questionText: 'Semboyan bangsa Indonesia adalah Bhinneka Tunggal Ika yang berarti...',
    options: [
      'Sama saja walau berbeda',
      'Berbeda-beda tetapi tetap satu jua',
      'Persatuan Indonesia',
      'Keadilan bagi sesama'
    ],
    correctOptionIndex: 1,
    rewardCoins: 15,
    rewardXp: 25
  }
];

// Self-executing database seed
QuizRepository.seedQuestions(SEED_QUESTIONS).catch(err => {
  console.error('Quiz seeding failed:', err);
});

// GET RANDOM QUESTION BY SUBJECT
router.get('/question', async (c) => {
  try {
    const userId = c.get('userId');
    const subject = c.req.query('subject');

    if (!subject) {
      return c.json({ error: 'Mata pelajaran (subject) harus dipilih!' }, 400);
    }

    const kancil = await KancilRepository.getOrCreate(userId);
    const questions = await QuizRepository.getQuestions(subject, kancil.level);

    if (questions.length === 0) {
      return c.json({ error: `Maaf, belum ada soal untuk mata pelajaran ${subject} pada levelmu.` }, 404);
    }

    // Pick a random question
    const randomIndex = Math.floor(Math.random() * questions.length);
    const question = questions[randomIndex];

    // Cache the active question for this user to verify on submit (prevents client-side manipulation)
    await cacheService.set(`active-quiz:${userId}`, question.id.toString(), 300); // 5 min expiry

    // Return question WITHOUT correctOptionIndex to prevent cheating
    return c.json({
      question: {
        id: question.id,
        subject: question.subject,
        questionText: question.questionText,
        options: question.options,
        rewardCoins: question.rewardCoins,
        rewardXp: question.rewardXp
      }
    });

  } catch (err) {
    console.error('Fetch question error:', err);
    return c.json({ error: 'Gagal mengambil soal kuis.' }, 500);
  }
});

// SUBMIT QUIZ ANSWER
router.post('/submit', async (c) => {
  try {
    const userId = c.get('userId');
    const { questionId, answerIndex } = await c.req.json();

    if (questionId === undefined || answerIndex === undefined) {
      return c.json({ error: 'ID Soal dan indeks jawaban wajib diisi!' }, 400);
    }

    // 1. Verify cached active question matches the submitted questionId
    const cachedQId = await cacheService.get(`active-quiz:${userId}`);
    if (!cachedQId || cachedQId !== questionId.toString()) {
      return c.json({ error: 'Waktu kuis habis atau pertanyaan tidak valid. Silakan ambil soal baru.' }, 400);
    }

    // Clear active quiz from cache
    await cacheService.del(`active-quiz:${userId}`);

    // 2. Fetch question details
    const question = await QuizRepository.getQuestionById(parseInt(questionId, 10));
    if (!question) {
      return c.json({ error: 'Pertanyaan tidak ditemukan.' }, 404);
    }

    const kancil = await KancilRepository.getOrCreate(userId);
    const progress = await ProgressRepository.getOrCreate(userId);
    const isCorrect = question.correctOptionIndex === parseInt(answerIndex, 10);

    let responsePayload: any = {
      correct: isCorrect,
      correctAnswerIndex: question.correctOptionIndex,
      rewardCoins: 0,
      rewardXp: 0,
      levelUp: null,
      worldUnlocked: null
    };

    let updatedKancilStatus = { ...kancil };
    let updatedProgress = { ...progress };

    if (isCorrect) {
      // Reward logic
      responsePayload.rewardCoins = question.rewardCoins;
      responsePayload.rewardXp = question.rewardXp;

      // Handle level up (capped at level 20 max)
      let currentXp = kancil.xp + question.rewardXp;
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

      const kancilUpdates: any = {
        coins: kancil.coins + question.rewardCoins,
        xp: currentXp,
        level: currentLevel,
        happiness: Math.min(100, kancil.happiness + 8),
        health: Math.min(100, kancil.health + 2)
      };

      if (didLevelUp) {
        responsePayload.levelUp = {
          oldLevel: kancil.level,
          newLevel: currentLevel
        };
        // Logika unlock dunia baru:
        // Level 2 -> Dunia 2 (Kebun)
        // Level 3 -> Dunia 3 (Hutan)
        // Level 4 -> Dunia 4 (Desa)
        // Level 5 -> Dunia 5 (Istana Kancil)
        const targetWorldId = currentLevel;
        if (targetWorldId <= 5 && !progress.unlockedWorlds.includes(targetWorldId)) {
          const newUnlockedWorlds = [...progress.unlockedWorlds, targetWorldId].sort();
          updatedProgress = await ProgressRepository.update(userId, {
            unlockedWorlds: newUnlockedWorlds,
            currentWorldId: targetWorldId // Auto enter new world!
          });
          responsePayload.worldUnlocked = targetWorldId;
        }
      }

      updatedKancilStatus = await KancilRepository.update(userId, kancilUpdates);
    } else {
      // Incorrect answer: deduct energy and happiness
      updatedKancilStatus = await KancilRepository.update(userId, {
        energy: Math.max(0, kancil.energy - 8),
        happiness: Math.max(0, kancil.happiness - 4)
      });
    }

    // Sync status via WebSockets
    notifyUserStatusUpdate(userId, updatedKancilStatus);

    responsePayload.kancil = updatedKancilStatus;
    responsePayload.progress = updatedProgress;

    return c.json(responsePayload);

  } catch (err) {
    console.error('Submit answer error:', err);
    return c.json({ error: 'Gagal mengirimkan jawaban kuis.' }, 500);
  }
});

// SELECT ACTIVE WORLD FROM MAP
router.post('/active-world', async (c) => {
  try {
    const userId = c.get('userId');
    const { worldId } = await c.req.json();

    if (worldId === undefined) {
      return c.json({ error: 'ID Dunia wajib diisi!' }, 400);
    }

    const progress = await ProgressRepository.getOrCreate(userId);
    const targetWorldId = parseInt(worldId, 10);

    if (!progress.unlockedWorlds.includes(targetWorldId)) {
      return c.json({ error: 'Dunia ini masih terkunci! Jawab kuis dan naikkan level Kancil untuk membukanya.' }, 400);
    }

    const updatedProgress = await ProgressRepository.update(userId, {
      currentWorldId: targetWorldId
    });

    return c.json({
      success: true,
      message: 'Berhasil berpindah dunia!',
      progress: updatedProgress
    });
  } catch (err) {
    console.error('Update active world error:', err);
    return c.json({ error: 'Gagal memperbarui dunia aktif.' }, 500);
  }
});

export default router;
