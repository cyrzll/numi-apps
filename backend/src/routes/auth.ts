import { Hono } from 'hono';
import { sign } from 'hono/jwt';
import crypto from 'crypto';
import { UserRepository, KancilRepository, ProgressRepository } from '../repositories/index.js';
import { authMiddleware, JWT_SECRET } from '../middleware/auth.js';

const router = new Hono<{ Variables: { userId: string; username: string } }>();

// Helper to hash passwords using native Node.js crypto
function hashPassword(password: string): string {
  return crypto.createHash('sha256').update(password).digest('hex');
}

// REGISTER
router.post('/register', async (c) => {
  try {
    const { username, password } = await c.req.json();

    if (!username || !password) {
      return c.json({ error: 'Username dan password wajib diisi!' }, 400);
    }

    if (username.length < 3) {
      return c.json({ error: 'Username minimal 3 karakter!' }, 400);
    }

    if (password.length < 6) {
      return c.json({ error: 'Password minimal 6 karakter!' }, 400);
    }

    // Check if user already exists
    const existing = await UserRepository.findByUsername(username);
    if (existing) {
      return c.json({ error: 'Username sudah terdaftar! Pilih nama lain.' }, 400);
    }

    // Hash password & create user
    const passwordHash = hashPassword(password);
    const user = await UserRepository.create(username, passwordHash);

    // Initialize Kancil status & progress
    await KancilRepository.getOrCreate(user.id);
    await ProgressRepository.getOrCreate(user.id);

    return c.json({ success: true, message: 'Pendaftaran berhasil! Silakan login.' });
  } catch (err) {
    console.error('Registration error:', err);
    return c.json({ error: 'Terjadi kesalahan sistem saat mendaftar.' }, 500);
  }
});

// LOGIN
router.post('/login', async (c) => {
  try {
    const { username, password } = await c.req.json();

    if (!username || !password) {
      return c.json({ error: 'Username dan password wajib diisi!' }, 400);
    }

    const user = await UserRepository.findByUsername(username);
    if (!user) {
      return c.json({ error: 'Username atau password salah!' }, 400);
    }

    if (user.bannedUntil && new Date(user.bannedUntil) > new Date()) {
      const banEnd = new Date(user.bannedUntil).toLocaleString('id-ID');
      return c.json({ error: `Akun Anda sedang ditangguhkan (banned) sampai: ${banEnd}` }, 403);
    }

    const passwordHash = hashPassword(password);
    if (user.passwordHash !== passwordHash) {
      return c.json({ error: 'Username atau password salah!' }, 400);
    }

    // Generate JWT
    const payload = {
      sub: user.id,
      username: user.username,
      role: user.role,
      exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 7, // 7 days expiry
    };

    const token = await sign(payload, JWT_SECRET);

    // Fetch associated data
    const kancil = await KancilRepository.getOrCreate(user.id);
    const progress = await ProgressRepository.getOrCreate(user.id);

    return c.json({
      success: true,
      token,
      user: {
        id: user.id,
        username: user.username,
        role: user.role
      },
      kancil,
      progress
    });
  } catch (err) {
    console.error('Login error:', err);
    return c.json({ error: 'Terjadi kesalahan sistem saat login.' }, 500);
  }
});

// GET ME
router.get('/me', authMiddleware, async (c) => {
  try {
    const userId = c.get('userId');
    const user = await UserRepository.findById(userId);

    if (!user) {
      return c.json({ error: 'User tidak ditemukan' }, 404);
    }

    if (user.bannedUntil && new Date(user.bannedUntil) > new Date()) {
      const banEnd = new Date(user.bannedUntil).toLocaleString('id-ID');
      return c.json({ error: `Akun Anda sedang ditangguhkan (banned) sampai: ${banEnd}` }, 403);
    }

    const kancil = await KancilRepository.getOrCreate(userId);
    const progress = await ProgressRepository.getOrCreate(userId);

    return c.json({
      user: {
        id: user.id,
        username: user.username,
        role: user.role
      },
      kancil,
      progress
    });
  } catch (err) {
    console.error('Get profile error:', err);
    return c.json({ error: 'Terjadi kesalahan sistem.' }, 500);
  }
});

export default router;
