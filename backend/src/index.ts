import { serve } from '@hono/node-server';
import { Hono } from 'hono';
import { cors } from 'hono/cors';
import authRouter from './routes/auth.js';
import kancilRouter from './routes/kancil.js';
import shopRouter from './routes/shop.js';
import quizRouter from './routes/quiz.js';
import adminRouter from './routes/admin.js';
import { UserRepository } from './repositories/index.js';
import { initWebSocket } from './ws/websocket.js';
import crypto from 'crypto';

const app = new Hono();

// CORS Middleware
app.use('*', cors({
  origin: (origin) => origin || '*', // Allow frontend development origin
  allowHeaders: ['Content-Type', 'Authorization'],
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  exposeHeaders: ['Content-Length'],
  maxAge: 600,
  credentials: true,
}));

// Route Definitions
app.get('/', (c) => {
  return c.text('Kancil Belajar Backend API is online! 🐇📚');
});

app.route('/api/auth', authRouter);
app.route('/api/kancil', kancilRouter);
app.route('/api/shop', shopRouter);
app.route('/api/quiz', quizRouter);
app.route('/api/admin', adminRouter);

// Seeding default Admin account on boot
const adminUsername = 'admin';
UserRepository.findByUsername(adminUsername).then(async (existingAdmin) => {
  if (!existingAdmin) {
    const adminPasswordHash = crypto.createHash('sha256').update('admin123').digest('hex');
    const adminUser = await UserRepository.create(adminUsername, adminPasswordHash, 'admin');
    console.log(`👤 Seeded default admin account: ${adminUser.username} / admin123`);
  }
}).catch(err => {
  console.error('Failed to seed default admin user:', err);
});

// Start Server
const port = 3000;
const server = serve({
  fetch: app.fetch,
  port
}, (info) => {
  console.log(`📡 Server is running on http://localhost:${info.port}`);
});

// Initialize WebSocket handler bound to HTTP server
initWebSocket(server);
