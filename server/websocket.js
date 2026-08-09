import { WebSocketServer } from 'ws';

class WebSocketManager {
  constructor() {
    this.wss = null;
    this.clients = new Set();
  }

  init(server) {
    this.wss = new WebSocketServer({ server, path: '/ws' });

    this.wss.on('connection', (ws) => {
      this.clients.add(ws);
      console.log(`[WebSocket] Client connected. Total active connections: ${this.clients.size}`);

      ws.on('message', (message) => {
        try {
          const parsed = JSON.parse(message.toString());
          console.log('[WebSocket] Received message:', parsed.type);
        } catch (err) {
          console.error('[WebSocket] Parsing error:', err);
        }
      });

      ws.on('close', () => {
        this.clients.delete(ws);
        console.log(`[WebSocket] Client disconnected. Remaining: ${this.clients.size}`);
      });

      ws.on('error', (err) => {
        console.error('[WebSocket] Socket error:', err);
      });
    });
  }

  broadcast(eventType, payload) {
    const data = JSON.stringify({ type: eventType, data: payload, timestamp: new Date().toISOString() });
    for (const client of this.clients) {
      if (client.readyState === 1) { // OPEN
        client.send(data);
      }
    }
  }
}

export const wsManager = new WebSocketManager();
