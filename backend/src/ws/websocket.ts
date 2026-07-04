import { WebSocketServer, WebSocket } from 'ws';
import { verifyToken } from '../middleware/auth.js';
import { tickKancilState } from '../services/kancil.js';
import { UserRepository } from '../repositories/index.js';
import url from 'url';

// Store for active connections: userId -> WebSocket
const activeConnections = new Map<string, WebSocket>();

export function initWebSocket(server: any) {
  const wss = new WebSocketServer({ noServer: true });

  // Handle server upgrade manually to verify token and router path
  server.on('upgrade', async (request: any, socket: any, head: any) => {
    const parsedUrl = url.parse(request.url, true);
    const pathname = parsedUrl.pathname;

    if (pathname === '/ws') {
      const token = parsedUrl.query.token as string;
      
      if (!token) {
        socket.write('HTTP/1.1 401 Unauthorized\r\n\r\n');
        socket.destroy();
        return;
      }

      const payload = await verifyToken(token);
      if (!payload) {
        socket.write('HTTP/1.1 403 Forbidden\r\n\r\n');
        socket.destroy();
        return;
      }

      // Block suspended users
      const user = await UserRepository.findById(payload.sub);
      if (user && user.bannedUntil && new Date(user.bannedUntil) > new Date()) {
        socket.write('HTTP/1.1 403 Forbidden\r\n\r\n');
        socket.destroy();
        return;
      }

      wss.handleUpgrade(request, socket, head, (ws) => {
        wss.emit('connection', ws, request, payload.sub);
      });
    } else {
      socket.destroy();
    }
  });

  wss.on('connection', (ws: WebSocket, request: any, userId: string) => {
    console.log(`🔌 WebSocket connected: User ${userId}`);
    
    // Store connection
    activeConnections.set(userId, ws);

    // Send immediate current status update
    tickKancilState(userId)
      .then((status) => {
        if (ws.readyState === WebSocket.OPEN) {
          ws.send(JSON.stringify({ type: 'STATUS_INIT', data: status }));
        }
      })
      .catch((err) => console.error('WS initial status error:', err));

    ws.on('message', (message: string) => {
      try {
        const payload = JSON.parse(message);
        
        if (payload.type === 'PING') {
          ws.send(JSON.stringify({ type: 'PONG' }));
        }
      } catch (err) {
        console.error('WS message error:', err);
      }
    });

    ws.on('close', () => {
      console.log(`🔌 WebSocket disconnected: User ${userId}`);
      activeConnections.delete(userId);
    });

    ws.on('error', (err) => {
      console.error(`WebSocket error for user ${userId}:`, err);
      activeConnections.delete(userId);
    });
  });

  // Centralized Tick Timer: Runs every 10 seconds for online users only
  setInterval(async () => {
    for (const [userId, ws] of activeConnections.entries()) {
      if (ws.readyState === WebSocket.OPEN) {
        try {
          const updatedStatus = await tickKancilState(userId);
          ws.send(JSON.stringify({
            type: 'TICK',
            data: updatedStatus
          }));
        } catch (err) {
          console.error(`Error processing tick for user ${userId}:`, err);
        }
      }
    }
  }, 10000);

  console.log('🚀 WebSocket Server handler initialized at /ws');
}

// Helper to broadcast status updates to a specific user (if online)
// Useful when actions are performed via HTTP REST API and we want to sync WS immediately
export function notifyUserStatusUpdate(userId: string, data: any) {
  const ws = activeConnections.get(userId);
  if (ws && ws.readyState === WebSocket.OPEN) {
    ws.send(JSON.stringify({
      type: 'TICK',
      data
    }));
  }
}

export function forceDisconnectUser(userId: string) {
  const ws = activeConnections.get(userId);
  if (ws) {
    console.log(`🔌 Suspension: Kicking user ${userId} out of WebSocket session`);
    ws.close(4003, 'Account suspended');
    activeConnections.delete(userId);
  }
}
