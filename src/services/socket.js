class SocketService {
  constructor() {
    this.ws = null;
    this.listeners = new Map();
    this.connected = false;
    this.reconnectTimer = null;
  }

  connect() {
    if (this.ws) return;

    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const host = window.location.host;
    // In dev, WebSocket connects via Vite proxy or direct to 5000
    const wsUrl = `${protocol}//${host}/ws`;

    try {
      this.ws = new WebSocket(wsUrl);

      this.ws.onopen = () => {
        console.log('[WS] Connected to GatePass Real-time WebSocket');
        this.connected = true;
        this.emitStatus(true);
      };

      this.ws.onmessage = (event) => {
        try {
          const payload = JSON.parse(event.data);
          const { type, data } = payload;

          if (this.listeners.has(type)) {
            this.listeners.get(type).forEach(cb => cb(data));
          }
          if (this.listeners.has('*')) {
            this.listeners.get('*').forEach(cb => cb(type, data));
          }
        } catch (err) {
          console.error('[WS] Message parse error:', err);
        }
      };

      this.ws.onclose = () => {
        console.log('[WS] Disconnected. Scheduling reconnect in 3s...');
        this.connected = false;
        this.ws = null;
        this.emitStatus(false);
        this.reconnectTimer = setTimeout(() => this.connect(), 3000);
      };

      this.ws.onerror = (err) => {
        console.error('[WS] Error:', err);
      };
    } catch (err) {
      console.error('[WS] Connection failed:', err);
      this.reconnectTimer = setTimeout(() => this.connect(), 3000);
    }
  }

  on(eventType, callback) {
    if (!this.listeners.has(eventType)) {
      this.listeners.set(eventType, new Set());
    }
    this.listeners.get(eventType).add(callback);

    return () => {
      if (this.listeners.has(eventType)) {
        this.listeners.get(eventType).delete(callback);
      }
    };
  }

  emitStatus(isOnline) {
    if (this.listeners.has('STATUS_CHANGE')) {
      this.listeners.get('STATUS_CHANGE').forEach(cb => cb(isOnline));
    }
  }
}

export const socketService = new SocketService();
