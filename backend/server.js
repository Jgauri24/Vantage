const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');
const Message = require('./models/Message'); 
const path = require('path');

require('dotenv').config();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*', 
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
const adminRoutes = require('./routes/admin');


const { authenticate } = require('./middleware/auth');

mongoose
  .connect(MONGO_URI)
  .then(() => console.log('MongoDB connected'))
  .catch((err) => console.error('MongoDB connection error:', err));





app.use(express.json());

// Register routes
app.use('/api/auth', authRoutes);
app.use('/api/jobs', jobRoutes);
app.use('/api/bids', bidRoutes);
app.use('/api/users', userRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/admin', adminRoutes);

app.use('/uploads', express.static('uploads'));

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Vantage API is running' });
});
app.use(express.static(path.join(__dirname, '../frontend/dist')));

// Protected API route
app.get('/api/profile', authenticate, (req, res) => {
  res.json({ user: req.user });
});

// Catch-all for React routing (ALWAYS LAST)
app.get('*', (req, res) => {
  if (req.path.startsWith('/api')) {
    return res.status(404).json({ message: 'API route not found' });
  }

  res.sendFile(path.join(__dirname, '../frontend/dist', 'index.html'));
});


io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  socket.on('joinConversation', (conversationId) => {
    socket.join(conversationId);
    console.log(`User ${socket.id} joined conversation ${conversationId}`);
  });

  socket.on('sendMessage', async (data) => {
    const { jobId, senderId, recipientId, content } = data;
    
    // Save to DB
    try {
      const newMessage = new Message({
        job: jobId,
        sender: senderId,
        recipient: recipientId,
        content
      });
      await newMessage.save();
      
      // Populate sender and recipient details before emitting
      await newMessage.populate('sender', 'name role');
      await newMessage.populate('recipient', 'name role');

      // Create conversation room ID (sorted participants)
      const participants = [senderId, recipientId].sort();
      const conversationId = `${jobId}_${participants.join('_')}`;

      // Emit to the conversation room
      io.to(conversationId).emit('receiveMessage', newMessage);
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

