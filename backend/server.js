require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const { Server } = require('socket.io');
const http = require('http');

const app = express();
const server = http.createServer(app);

/* -------------------- SOCKET.IO -------------------- */

const io = new Server(server, {
  cors: {
    origin: [
      process.env.FRONTEND_URL,
      'http://localhost:3000',
      'https://coc-auction-2026.vercel.app',
      'https://lb.pclub.online'
    ],
    methods: ['GET', 'POST'],
    credentials: true
  }
});

/* -------------------- CORS -------------------- */

const allowedOrigins = [
  process.env.FRONTEND_URL,
  'http://localhost:3000',
  'https://coc-auction-2026.vercel.app',
  'https://lb.pclub.online'
];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin) return callback(null, true); // Postman / server-to-server

    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    return callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Explicit preflight handling
app.options('*', cors());

/* -------------------- MIDDLEWARE -------------------- */

app.use(express.json());

/* -------------------- DATABASE -------------------- */

mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

/* -------------------- ROUTES -------------------- */

const playerRoutes = require('./routes/players');
const teamRoutes = require('./routes/teams');
const transactionLogsRouter = require('./routes/transactionLogs');

app.use('/api/players', playerRoutes);
app.use('/api/teams', teamRoutes);
app.use('/api/logs', transactionLogsRouter);

/* -------------------- SOCKET ACCESS IN ROUTES -------------------- */

app.set('io', io);

io.on('connection', socket => {
  console.log('Client connected:', socket.id);

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

/* -------------------- HEALTH CHECK -------------------- */

app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Server is running'
  });
});

/* -------------------- SERVER -------------------- */

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
