const jwt = require('jsonwebtoken');

const generateToken = (userId, role) => {
  return jwt.sign(
    { id: userId, role },
    process.env.JWT_SECRET || 'vantage_dev_secret_key',
    { expiresIn: '7d' }
  );
};

module.exports = { generateToken };
