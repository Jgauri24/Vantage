const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();


app.use(cors({

}));

const PORT = process.env.PORT || 5001;
const MONGO_URI = process.env.MONGO_URI ;

const authRoutes = require('./routes/auth');
const jobRoutes = require('./routes/jobs');
const bidRoutes = require('./routes/bids');
const userRoutes = require('./routes/users');
const paymentRoutes = require('./routes/payments');
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
app.use('/uploads', express.static('uploads'));

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Vantage API is running' });
});

app.get('/api/profile', authenticate, (req, res) => {
  res.json({ user: req.user });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
