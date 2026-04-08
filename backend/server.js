const express    = require('express');
const mongoose   = require('mongoose');
const cors       = require('cors');
const http       = require('http');
const { Server } = require('socket.io');
require('dotenv').config();

const app    = express();
const server = http.createServer(app);
const PORT   = process.env.PORT || 3000;

const io = new Server(server, {
  cors: {
    origin:  '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
  },
  transports: ['polling', 'websocket'],
});

app.use(cors({ origin: '*', credentials: false }));
app.use(express.json());

app.set('io', io);

io.on('connection', (socket) => {
  console.log('User connected:', socket.id);
  socket.on('join', (userId) => {
    socket.join(userId);
    console.log(`User ${userId} joined room`);
  });
  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

app.use('/api/auth',        require('./routes/authRoutes'));
app.use('/api/restaurants', require('./routes/restaurantRoutes'));
app.use('/api/orders',      require('./routes/orderRoutes'));
app.use('/api/admin',       require('./routes/adminRoutes'));
app.use('/api/payment',     require('./routes/paymentRoutes'));
app.use('/api/upload',      require('./routes/uploadRoutes'));

app.get('/', (req, res) => {
  res.send('Swiggy backend is running!');
});

app.get('/health', (req, res) => {
  res.json({
    status:    'ok',
    message:   'Server is healthy',
    timestamp: new Date(),
    uptime:    process.uptime(),
  });
});

mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('MongoDB connected successfully!');
    server.listen(PORT, '0.0.0.0', () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch(err => console.log('MongoDB connection error:', err));

module.exports = { io };