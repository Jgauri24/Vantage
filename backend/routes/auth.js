const express = require('express');
const User = require('../models/User');
const { generateToken } = require('../config/jwt');

const router = express.Router();

router.post('/register', async (req, res) => {
  const { email, password, name, role, company } = req.body;

  if (!email || !password || !name || !role) {
    return res.status(400).json({ error: 'All fields are required.' });
  }

  if (!['Client', 'Provider', 'Admin'].includes(role)) {
    return res.status(400).json({ error: 'Invalid role. Must be Client, Provider, or Admin.' });
  }

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return res.status(400).json({ error: 'Email already registered.' });
  }

  const user = new User({ email, password, name, role, company });
  await user.save();

  const token = generateToken(user._id, user.role);

  res.status(201).json({
    token,
    user: {
      id: user._id,
      email: user.email,
      name: user.name,
      role: user.role,
      company: user.company
    }
  });
});

router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required.' });
  }

  const user = await User.findOne({ email });
  if (!user) {
    return res.status(401).json({ error: 'Invalid credentials.' });
  }

  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    return res.status(401).json({ error: 'Invalid credentials.' });
  }

  const token = generateToken(user._id, user.role);

  res.json({
    token,
    user: {
      id: user._id,
      email: user.email,
      name: user.name,
      role: user.role,
      company: user.company
    }
  });
});

module.exports = router;
