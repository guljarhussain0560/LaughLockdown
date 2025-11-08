import { createServer } from 'http';
import { Server } from 'socket.io';
import next from 'next';

const dev = process.env.NODE_ENV !== 'production';
const hostname = 'localhost';
const port = 3000;

const app = next({ dev, hostname, port });
const handler = app.getRequestHandler();

app.prepare().then(() => {
  const httpServer = createServer(handler);
  
  const io = new Server(httpServer, {
    cors: {
      origin: process.env.NEXTAUTH_URL || `http://localhost:${port}`,
      methods: ['GET', 'POST']
    }
  });

  // Track rooms, participants, and game states
  const rooms = new Map(); // contestId -> Set of socket.id
  const gameStates = new Map(); // contestId -> { currentMemeIndex, memeQueue, startTimestamp, gameStarted }

  io.on('connection', (socket) => {
    console.log(`✅ Client connected: ${socket.id}`);

    // Join multiplayer room
    socket.on('join-room', ({ contestId, userId }) => {
      socket.join(contestId);
      
      if (!rooms.has(contestId)) {
        rooms.set(contestId, new Set());
      }
      rooms.get(contestId).add(socket.id);

      // Notify others in the room
      socket.to(contestId).emit('user-joined', {
        userId,
        socketId: socket.id
      });

      // Send existing participants to the new user
      const participants = Array.from(rooms.get(contestId)).filter(id => id !== socket.id);
      socket.emit('existing-participants', participants);

      // Send current game state to new joiner (for late joiners)
      if (gameStates.has(contestId)) {
        const currentGameState = gameStates.get(contestId);
        console.log(`📤 Sending current game state to late joiner ${socket.id}:`, currentGameState);
        socket.emit('sync-game-state', currentGameState);
      }

      console.log(`📍 User ${userId} joined room ${contestId} (${rooms.get(contestId).size} participants)`);
    });

    // WebRTC Signaling
    socket.on('offer', ({ offer, to }) => {
      console.log(`📤 Sending offer from ${socket.id} to ${to}`);
      io.to(to).emit('offer', {
        offer,
        from: socket.id
      });
    });

    socket.on('answer', ({ answer, to }) => {
      console.log(`📤 Sending answer from ${socket.id} to ${to}`);
      io.to(to).emit('answer', {
        answer,
        from: socket.id
      });
    });

    socket.on('ice-candidate', ({ candidate, to }) => {
      console.log(`📤 Sending ICE candidate from ${socket.id} to ${to}`);
      io.to(to).emit('ice-candidate', {
        candidate,
        from: socket.id
      });
    });

    // Meme synchronization - Google Meet style (broadcast to ALL including sender)
    socket.on('sync-memes', ({ contestId, memes }) => {
      console.log(`📋 Syncing memes for room ${contestId} - Broadcasting to ALL`);
      // Broadcast to EVERYONE in the room (including sender)
      io.to(contestId).emit('memes-synced', { memes });
    });

    socket.on('next-meme', ({ contestId, memeIndex }) => {
      console.log(`⏭️ Host advancing to meme ${memeIndex} in room ${contestId} - Broadcasting to ALL`);
      
      // Update stored game state
      if (gameStates.has(contestId)) {
        const state = gameStates.get(contestId);
        state.currentMemeIndex = memeIndex;
        gameStates.set(contestId, state);
      }
      
      // Broadcast to EVERYONE in the room (including sender)
      io.to(contestId).emit('advance-meme', { memeIndex });
    });

    // Game state synchronization (host broadcasts game start/state) - Google Meet style
    socket.on('game-state-update', ({ contestId, state }) => {
      console.log(`🎮 Game state update for room ${contestId} - Broadcasting to ALL:`, state);
      
      // Store the game state for late joiners
      gameStates.set(contestId, {
        currentMemeIndex: state.currentMemeIndex || 0,
        memeQueue: state.memeQueue || [],
        startTimestamp: state.startTimestamp || Date.now(),
        gameStarted: state.gameStarted || false
      });
      
      // Broadcast to EVERYONE in the room (including sender)
      io.to(contestId).emit('game-state-changed', { state });
    });

    // Disconnect handling
    socket.on('disconnect', () => {
      console.log(`❌ Client disconnected: ${socket.id}`);
      
      // Remove from all rooms
      rooms.forEach((participants, contestId) => {
        if (participants.has(socket.id)) {
          participants.delete(socket.id);
          socket.to(contestId).emit('user-left', socket.id);
          
          if (participants.size === 0) {
            rooms.delete(contestId);
          }
        }
      });
    });
  });

  httpServer
    .once('error', (err) => {
      console.error(err);
      process.exit(1);
    })
    .listen(port, () => {
      console.log(`🚀 Server running at http://${hostname}:${port}`);
      console.log(`✅ Socket.io server initialized`);
    });
});
