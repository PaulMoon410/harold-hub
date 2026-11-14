// Harold Hub Server
// Combines chat API, FTP integration, and WebSocket for real-time events

const express = require('express');
const cors = require('cors');
const { createServer } = require('http');
const { Server } = require('socket.io');
const path = require('path');

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
});

const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// FTP routes
const { router: ftpRouter } = require('./ftp-server.js');
app.use('/api/ftp', ftpRouter);

// Chat API
app.post('/api/chat', async (req, res) => {
  try {
    const { message, history, sessionId } = req.body;

    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    // Generate response (swap with actual Harold logic)
    const response = generateHaroldResponse(message, history);

    // Broadcast to WebSocket clients
    io.emit('harold-event', {
      event: 'chat-response',
      data: { message, response, sessionId },
      timestamp: new Date().toISOString(),
    });

    res.json({ response });
  } catch (error) {
    console.error('Chat API error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Webhook for local machine events
app.post('/api/webhook', (req, res) => {
  const { event, data } = req.body;

  // Broadcast to all connected clients
  io.emit('harold-event', {
    event,
    data,
    timestamp: new Date().toISOString(),
  });

  res.json({ success: true });
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// WebSocket connection
io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);

  socket.on('join', (sessionId) => {
    socket.join(sessionId);
    console.log(`Socket ${socket.id} joined session ${sessionId}`);
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

// Response generation (placeholder for actual Harold logic)
function generateHaroldResponse(message, history) {
  const lower = message.toLowerCase();

  if (lower.includes('hello') || lower.includes('hi')) {
    return "Hello! I'm Harold, your AI assistant with file management capabilities. How can I help you today?";
  }
  if (lower.includes('how are you')) {
    return "I'm just a program, but I'm functioning perfectly! How about you?";
  }
  if (lower.includes('name')) {
    return "I'm Harold, your AI assistant. I can help with chat and file management!";
  }
  if (lower.includes('help')) {
    return "I'm here to help! You can ask me questions, request information, or manage files. Try saying 'list files' or 'search for [filename]'";
  }
  if (lower.includes('cool') || lower.includes('awesome') || lower.includes('great')) {
    return "Yes! With the FTP server integration, I can help you manage files remotely. It's pretty cool!";
  }

  const responses = [
    "That's interesting! Tell me more.",
    "I understand. What else would you like to discuss?",
    "Thanks for sharing that with me.",
    "I'm here to help with whatever you need. I can also manage files if you ask!",
  ];
  return responses[Math.floor(Math.random() * responses.length)];
}

server.listen(PORT, () => {
  console.log(`
  ╔══════════════════════════════════════════════╗
  ║         Harold Hub Server                    ║
  ║                                              ║
  ║  Chat API:  http://localhost:${PORT}/api/chat  ║
  ║  Webhook:   http://localhost:${PORT}/api/webhook ║
  ║  Health:    http://localhost:${PORT}/health    ║
  ║  WebSocket: ws://localhost:${PORT}             ║
  ╚══════════════════════════════════════════════╝
  `);
});