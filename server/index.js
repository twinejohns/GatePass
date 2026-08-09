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
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Attach REST API Routes
app.use('/api', routes);

// Serve Production Frontend Dist Assets if built
const distPath = path.join(__dirname, '../dist');
if (fs.existsSync(distPath)) {
  app.use(express.static(distPath));
  app.get('*', (req, res) => {
    res.sendFile(path.join(distPath, 'index.html'));
  });
}

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
