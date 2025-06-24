const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');

const app = express();
const server = http.createServer(app);

// CORS config — ✅ good
app.use(cors({
  origin: 'http://localhost:3000',
  methods: ['GET', 'POST']
}));

const io = new Server(server, {
  cors: {
    origin: 'http://localhost:3000',
    methods: ['GET', 'POST']
  }
});

io.on('connection', (socket) => {
  console.log('🔌 A user connected:', socket.id);

  // Join a room
  socket.on('join', (roomId) => {
    socket.join(roomId);
    console.log(`📥 ${socket.id} joined room: ${roomId}`);
  });


  socket.on('code-change', ({ roomId, code, language }) => {
   
    socket.to(roomId).emit('code-change', { code, language });
  });

  
  socket.on('disconnecting', () => {
    const rooms = Array.from(socket.rooms).filter(r => r !== socket.id);
    rooms.forEach(room => {
      console.log(`👋 ${socket.id} is leaving room: ${room}`);
    });
  });

  socket.on('disconnect', () => {
    console.log('❌ A user disconnected:', socket.id);
  });
});


app.get('/', (req, res) => {
  res.send('✅ CodeLens server is running');
});


const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`🚀 Server listening on http://localhost:${PORT}`);
});
