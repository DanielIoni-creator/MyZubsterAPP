// services/websocket.js
const { Server } = require('socket.io');

let io;

function initializeWebSocket(server) {
  io = new Server(server, {
    cors: {
      origin: process.env.CORS_ORIGIN ? process.env.CORS_ORIGIN.split(',') : ['http://localhost:3000'],
      methods: ['GET', 'POST'],
      credentials: true
    }
  });

  io.on('connection', (socket) => {
    console.log(`🔌 Client connesso: ${socket.id}`);

    // L'utente si autentica per ricevere notifiche specifiche
    socket.on('authenticate', (userId) => {
      socket.join(`user_${userId}`);
      console.log(`🔐 Utente ${userId} autenticato su socket ${socket.id}`);
    });

    socket.on('disconnect', () => {
      console.log(`🔌 Client disconnesso: ${socket.id}`);
    });
  });

  return io;
}

function getIO() {
  if (!io) {
    throw new Error('WebSocket non inizializzato');
  }
  return io;
}

module.exports = { initializeWebSocket, getIO };