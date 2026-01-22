const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  role: {
    type: String,
    enum: ['Client', 'Provider', 'Admin'],
    required: true
  },
  bio: {
    type: String,
    default: ''
  },
  skills: [{
    type: String
  }],
  hourlyRate: {
    type: Number
  },
  company: {
    type: String,
    trim: true
  },
  location: {
    type: String,
    default: 'Remote'
  },
  walletBalance: {
    type: Number,
    default: 0
  },
  stripeCustomerId: {
    type: String
  },
  savedPaymentMethods: [{
    paymentMethodId: String,
    last4: String,
    brand: String,
    expMonth: Number,
    expYear: Number,
    isDefault: Boolean
  }],
  createdAt: {
    type: Date,
    default: Date.now
  }
});

userSchema.pre('save', async function() {
  if (!this.isModified('password')) return;
  this.password = await bcrypt.hash(this.password, 10);
});

userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
