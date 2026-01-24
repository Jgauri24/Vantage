const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');
const Message = require('./models/Message'); // Import Message model

require('dotenv').config();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*', // Allow all origins for dev
    methods: ['GET', 'POST']
  }
});



app.use(cors({

}));

const PORT = process.env.PORT || 5001;
const MONGO_URI = process.env.MONGO_URI ;

const authRoutes = require('./routes/auth');
const jobRoutes = require('./routes/jobs');
const bidRoutes = require('./routes/bids');
const userRoutes = require('./routes/users');
const paymentRoutes = require('./routes/payments');
const messageRoutes = require('./routes/messages');

const stripeWebhook = require('./routes/stripe-webhook');
const { authenticate } = require('./middleware/auth');

mongoose
  .connect(MONGO_URI)
  .then(() => console.log('MongoDB connected'))
  .catch((err) => console.error('MongoDB connection error:', err));

// Stripe webhook needs raw body, so register it BEFORE express.json()
app.use('/api/stripe', stripeWebhook);

// JSON body parser for all other routes
app.use(express.json());

// Register routes
app.use('/api/auth', authRoutes);
app.use('/api/jobs', jobRoutes);
app.use('/api/bids', bidRoutes);
app.use('/api/users', userRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/messages', messageRoutes);

app.use('/uploads', express.static('uploads'));

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Vantage API is running' });
});

app.get('/api/profile', authenticate, (req, res) => {
  res.json({ user: req.user });
});

// Socket.io Logic
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  socket.on('joinRoom', (jobId) => {
    socket.join(jobId);
    console.log(`User ${socket.id} joined room ${jobId}`);
  });

  socket.on('sendMessage', async (data) => {
    const { jobId, senderId, content } = data;
    
    // Save to DB
    try {
      const newMessage = new Message({
        job: jobId,
        sender: senderId,
        content
      });
      await newMessage.save();
       // Populate sender details before emitting
       await newMessage.populate('sender', 'name role');

      io.to(jobId).emit('receiveMessage', newMessage);
    } catch (err) {
      console.error('Error saving message:', err);
    }
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

