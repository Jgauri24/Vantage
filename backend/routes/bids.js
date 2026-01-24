const express = require('express');
const router = express.Router();
const { authenticate, authorizeRole } = require('../middleware/auth');
const Job = require('../models/Job');
const Bid = require('../models/Bid');
const User = require('../models/User');
const Transaction = require('../models/Transaction');

// Get provider's own bids
router.get('/my', authenticate, async (req, res) => {
  try {
    if (req.user.role !== 'Provider') {
      return res.status(403).json({ error: 'Only providers can access this endpoint' });
    }
    
    const bids = await Bid.find({ provider: req.user.id })
      .populate('job', 'title category status budget client createdAt')
      .populate('job.client', 'name company')
      .sort({ createdAt: -1 });
    
    res.json(bids);
  } catch (error) {
    console.error('Fetch provider bids error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Accept a bid
router.patch('/:id/accept', authenticate, authorizeRole('Client'), async (req, res) => {
  try {
    const bid = await Bid.findById(req.params.id).populate('job');
    if (!bid) return res.status(404).json({ error: 'Bid not found' });

    const job = await Job.findById(bid.job._id);
    if (!job) return res.status(404).json({ error: 'Job not found' });

   
    if (job.client.toString() !== req.user.id) {
        return res.status(403).json({ error: 'Access denied. You can only accept bids for your own jobs.' });
    }

    if (job.status !== 'Open') {
        return res.status(400).json({ error: 'Job is not open for contracting.' });
    }

    // Update Bid status
    bid.status = 'Accepted';
    await bid.save();

    // Update job status
    job.status = 'Contracted';
    job.paymentHeld = false; 
    await job.save();

    // Reject other bids for this job
    await Bid.updateMany(
        { job: job._id, _id: { $ne: bid._id } },
        { status: 'Rejected' }
    );

    // Get client for response
    const client = await User.findById(req.user.id);

    res.json({ 
        message: 'Bid accepted successfully. Job is now contracted.', 
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
