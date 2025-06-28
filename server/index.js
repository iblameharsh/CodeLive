const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');

const app = express();
const server = http.createServer(app);

// CORS config — ✅ good
app.use(cors({
  origin: 'https://codelive-eadg.onrender.com',
  methods: ['GET', 'POST']
}));

const io = new Server(server, {
  cors: {
    origin: 'https://codelive-eadg.onrender.com',
    methods: ['GET', 'POST'],
    credentials: true
  }
});

// Store code+language per room
const roomState = {};

io.on('connection', (socket) => {
  console.log('🔌 A user connected:', socket.id);

  // Join a room
  socket.on('join', (roomId) => {
    socket.join(roomId);
    console.log(`📥 ${socket.id} joined room: ${roomId}`);

    if (roomState[roomId]) {
      socket.emit('code-change', roomState[roomId]);
    }
  });


  socket.on('code-change', ({ roomId, code, language }) => {
    roomState[roomId] = { code, language };
    socket.to(roomId).emit('code-change', { code, language });
  });

  
  socket.on('disconnecting', () => {
    const rooms = Array.from(socket.rooms).filter(r => r !== socket.id);
    rooms.forEach(roomId => {
      const room = io.sockets.adapter.rooms.get(roomId);
      if (!room || room.size <= 1) {
        delete roomState[roomId]; // 🧹 Clean up room state
        console.log(`🧹 Room ${roomId} cleaned up`);
      }
      console.log(`👋 ${socket.id} is leaving room: ${roomId}`);
    });
  });

  socket.on('disconnect', () => {
    console.log('❌ A user disconnected:', socket.id);
  });

  socket.on('leave', (roomId) => {
    socket.leave(roomId);
    console.log(`👋 ${socket.id} left room: ${roomId}`);
  });
});



app.get('/', (req, res) => {
  res.send('✅ CodeLens server is running');
});


const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`🚀 Server listening on http://localhost:${PORT}`);
});
