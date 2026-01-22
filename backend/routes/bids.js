const express = require('express');
const router = express.Router();
const { authenticate, authorizeRole } = require('../middleware/auth');
const Job = require('../models/Job');
const Bid = require('../models/Bid');
const User = require('../models/User');
const Transaction = require('../models/Transaction');

// Accept a bid
router.patch('/:id/accept', authenticate, authorizeRole('Client'), async (req, res) => {
  try {
    const bid = await Bid.findById(req.params.id).populate('job');
    if (!bid) return res.status(404).json({ error: 'Bid not found' });

    const job = await Job.findById(bid.job._id);
    if (!job) return res.status(404).json({ error: 'Job not found' });

    // Verify ownership
    if (job.client.toString() !== req.user.id) {
        return res.status(403).json({ error: 'Access denied. You can only accept bids for your own jobs.' });
    }

    if (job.status !== 'Open') {
        return res.status(400).json({ error: 'Job is not open for contracting.' });
    }

    // Check wallet balance
    const client = await User.findById(req.user.id);
    if (!client.walletBalance || client.walletBalance < job.budget) {
        return res.status(400).json({ 
            error: 'Insufficient wallet balance',
            required: job.budget,
            current: client.walletBalance || 0
        });
    }

    // Deduct from client wallet
    client.walletBalance -= job.budget;
    await client.save();

    // Create transaction record for payment
    const transaction = new Transaction({
        user: client._id,
        type: 'job_payment',
        amount: -job.budget, // Negative for deduction
        balanceAfter: client.walletBalance,
        relatedJob: job._id,
        status: 'completed',
        description: `Payment for job: ${job.title}`
    });
    await transaction.save();

    // Update Bid status
    bid.status = 'Accepted';
    await bid.save();

    // Update Job status and payment tracking
    job.status = 'Contracted';
    job.paymentHeld = true;
    job.transactionIds.push(transaction._id);
    await job.save();

    // Reject other bids for this job
    await Bid.updateMany(
        { job: job._id, _id: { $ne: bid._id } },
        { status: 'Rejected' }
    );

    res.json({ 
        message: 'Bid accepted and payment processed', 
        bid, 
        job,
        newWalletBalance: client.walletBalance
    });
  } catch (error) {
    console.error('Bid acceptance error:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
