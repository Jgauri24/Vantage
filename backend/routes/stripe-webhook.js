const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Transaction = require('../models/Transaction');

const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

// Webhook endpoint must use raw body
router.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  const sig = req.headers['stripe-signature'];
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle the event
  try {
    switch (event.type) {
      case 'payment_intent.succeeded':
        await handlePaymentIntentSucceeded(event.data.object);
        break;

      case 'payment_intent.payment_failed':
        await handlePaymentIntentFailed(event.data.object);
        break;

      case 'payment_method.attached':
        console.log('Payment method attached:', event.data.object.id);
        break;

      case 'customer.created':
        console.log('Customer created:', event.data.object.id);
        break;

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    res.json({ received: true });
  } catch (error) {
    console.error('Webhook handler error:', error);
    res.status(500).json({ error: 'Webhook handler failed' });
  }
});

async function handlePaymentIntentSucceeded(paymentIntent) {
  console.log('Payment succeeded:', paymentIntent.id);
  
  // Check if this is a wallet funding transaction
  if (paymentIntent.metadata && paymentIntent.metadata.type === 'wallet_funding') {
    const userId = paymentIntent.metadata.userId;
    const amount = paymentIntent.amount / 100; // Convert from cents

    // Verify transaction was recorded
    const existingTransaction = await Transaction.findOne({
      stripePaymentIntentId: paymentIntent.id
    });

    if (!existingTransaction) {
      console.log('Transaction not found, creating from webhook');
      
      const user = await User.findById(userId);
      if (user) {
        user.walletBalance = (user.walletBalance || 0) + amount;
        await user.save();

        const transaction = new Transaction({
          user: userId,
          type: 'wallet_funding',
          amount: amount,
          balanceAfter: user.walletBalance,
          stripePaymentIntentId: paymentIntent.id,
          status: 'completed',
          description: `Wallet funded with $${amount.toFixed(2)} (via webhook)`
        });
        await transaction.save();
      }
    }
  }
}

async function handlePaymentIntentFailed(paymentIntent) {
  console.log('Payment failed:', paymentIntent.id);
  
  // Update any pending transactions to failed
  await Transaction.updateOne(
    { stripePaymentIntentId: paymentIntent.id },
    { status: 'failed' }
  );
}

module.exports = router;
