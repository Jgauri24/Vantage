const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const User = require('../models/User');
const Transaction = require('../models/Transaction');


const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);


router.post('/create-setup-intent', authenticate, async (req, res) => {
  try {
    let user = await User.findById(req.user.id);
    
    // Create Stripe customer if doesn't exist
    if (!user.stripeCustomerId) {
      const customer = await stripe.customers.create({
        email: user.email,
        name: user.name,
        metadata: {
          userId: user._id.toString()
        }
      });
      
      user.stripeCustomerId = customer.id;
      await user.save();
    }


    const setupIntent = await stripe.setupIntents.create({
      customer: user.stripeCustomerId,
      payment_method_types: ['card'],
    });

    res.json({ clientSecret: setupIntent.client_secret });
  } catch (error) {
    console.error('Setup intent error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Save payment method after setup
router.post('/save-payment-method', authenticate, async (req, res) => {
  try {
    const { paymentMethodId, setAsDefault } = req.body;
    const user = await User.findById(req.user.id);

    if (!user.stripeCustomerId) {
      return res.status(400).json({ error: 'No Stripe customer found' });
    }

    // Attach payment method to customer
    await stripe.paymentMethods.attach(paymentMethodId, {
      customer: user.stripeCustomerId,
    });


    const paymentMethod = await stripe.paymentMethods.retrieve(paymentMethodId);


    if (setAsDefault) {
      user.savedPaymentMethods.forEach(pm => pm.isDefault = false);
    }


    user.savedPaymentMethods.push({
      paymentMethodId: paymentMethod.id,
      last4: paymentMethod.card.last4,
      brand: paymentMethod.card.brand,
      expMonth: paymentMethod.card.exp_month,
      expYear: paymentMethod.card.exp_year,
      isDefault: setAsDefault || user.savedPaymentMethods.length === 0
    });

    await user.save();

    res.json({ 
      message: 'Payment method saved successfully',
      paymentMethod: user.savedPaymentMethods[user.savedPaymentMethods.length - 1]
    });
  } catch (error) {
    console.error('Save payment method error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get user's saved payment methods
router.get('/payment-methods', authenticate, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('savedPaymentMethods');
    res.json(user.savedPaymentMethods || []);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Remove saved payment method
router.delete('/payment-methods/:paymentMethodId', authenticate, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    const { paymentMethodId } = req.params;

    // Detach from Stripe
    await stripe.paymentMethods.detach(paymentMethodId);

    // Remove from user's saved methods
    user.savedPaymentMethods = user.savedPaymentMethods.filter(
      pm => pm.paymentMethodId !== paymentMethodId
    );


    const hasDefault = user.savedPaymentMethods.some(pm => pm.isDefault);
    if (!hasDefault && user.savedPaymentMethods.length > 0) {
      user.savedPaymentMethods[0].isDefault = true;
    }

    await user.save();

    res.json({ message: 'Payment method removed successfully' });
  } catch (error) {
    console.error('Remove payment method error:', error);
    res.status(500).json({ error: error.message });
  }
});

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
