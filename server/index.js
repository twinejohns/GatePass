import express from 'express';
import http from 'http';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import routes from './routes.js';
import { wsManager } from './websocket.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const server = http.createServer(app);

const PORT = process.env.PORT || 5000;

app.use(cors());

// Support high-resolution card artwork uploads (up to 50MB base64 data URLs)
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Attach REST API Routes
app.use('/api', routes);

// Prevent API requests from falling through to HTML static fallback
app.all('/api/*', (req, res) => {
  res.status(404).json({
    success: false,
    error: `API endpoint ${req.method} ${req.originalUrl} not found on server`
  });
});

// Serve Production Frontend Dist Assets if built
const distPath = path.join(__dirname, '../dist');
if (fs.existsSync(distPath)) {
  app.use(express.static(distPath));
  app.get('*', (req, res) => {
    res.sendFile(path.join(distPath, 'index.html'));
  });
}

// Global error handling middleware for payload errors
app.use((err, req, res, next) => {
  console.error('Server Express Error:', err);
  if (res.headersSent) {
    return next(err);
  }
  res.status(err.status || 500).json({
    success: false,
    error: err.message || 'Internal Server Error'
  });
});

// Initialize WebSocket Manager
wsManager.init(server);

server.listen(PORT, () => {
  console.log(`====================================================`);
  console.log(`🚀 GatePass Live Server running on http://localhost:${PORT}`);
  console.log(`📡 WebSocket endpoint ready at ws://localhost:${PORT}/ws`);
  if (fs.existsSync(distPath)) {
    console.log(`🌐 Serving Production Web Frontend from dist/`);
  }
  console.log(`====================================================`);
});
