import type { Context, Next } from 'hono';
import { verify } from 'hono/jwt';

export const JWT_SECRET = process.env.JWT_SECRET || 'kancil-secret-key-super-cute-123';

export interface UserPayload {
  sub: string;      // userId
  username: string;
  exp: number;
}

export async function verifyToken(token: string): Promise<UserPayload | null> {
  try {
    const payload = await verify(token, JWT_SECRET, 'HS256');
    return payload as unknown as UserPayload;
  } catch (err) {
    return null;
  }
}

export async function authMiddleware(c: Context, next: Next) {
  let token = '';

  // 1. Try to read from Authorization header
  const authHeader = c.req.header('Authorization');
  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.substring(7);
  }

  // 2. Try to read from query param (useful for WebSockets/media requests)
  if (!token) {
    token = c.req.query('token') || '';
  }

  // 3. Try to read from Cookie
  if (!token) {
    const cookieHeader = c.req.header('Cookie');
    if (cookieHeader) {
      const cookies = Object.fromEntries(
        cookieHeader.split(';').map(cookie => {
          const parts = cookie.split('=');
          return [parts[0].trim(), parts[1].trim()];
        })
      );
      token = cookies['token'] || '';
    }
  }

  if (!token) {
    return c.json({ error: 'Tidak terautentikasi. Silakan login terlebih dahulu.' }, 401);
  }

  const payload = await verifyToken(token);
  if (!payload) {
    return c.json({ error: 'Sesi telah berakhir atau tidak valid. Silakan login kembali.' }, 401);
  }

  // Inject user info into Context
  c.set('userId', payload.sub);
  c.set('username', payload.username);

  await next();
}
