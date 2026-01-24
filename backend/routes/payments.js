const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const User = require('../models/User');
const Transaction = require('../models/Transaction');

// Fund wallet with saved payment method
// Fund wallet (SIMULATED / TEST MODE)
router.post('/fund-wallet', authenticate, async (req, res) => {
  try {
    const { amount } = req.body;

    if (!amount || amount < 1) {
      return res.status(400).json({ error: 'Invalid amount. Minimum $1' });
    }

    if (amount > 1000000) {
      return res.status(400).json({ error: 'Maximum funding amount is $1,000,000' });
    }

    const user = await User.findById(req.user.id);


    // Update wallet balance
    user.walletBalance = (user.walletBalance || 0) + amount;
    await user.save();

    // Create transaction record
    const transaction = new Transaction({
        user: user._id,
        type: 'wallet_funding',
        amount: amount,
        balanceAfter: user.walletBalance,
        stripePaymentIntentId: 'simulated_' + Date.now(),
        status: 'completed',
        description: `Wallet funded with $${amount.toFixed(2)} (Test Mode)`
    });
    await transaction.save();

    res.json({
        success: true,
        walletBalance: user.walletBalance,
        transaction: transaction
    });

  } catch (error) {
    console.error('Fund wallet error:', error);
    res.status(500).json({ error: 'Payment processing failed' });
  }
});

// Get transaction history
router.get('/transactions', authenticate, async (req, res) => {
  try {
    const { type, limit = 50 } = req.query;
    
    let query = { user: req.user.id };
    if (type) query.type = type;

    const transactions = await Transaction.find(query)
      .populate('relatedJob', 'title budget')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit));

    res.json(transactions);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get wallet balance
router.get('/wallet-balance', authenticate, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('walletBalance');
    res.json({ walletBalance: user.walletBalance || 0 });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
