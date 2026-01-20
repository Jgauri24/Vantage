const express = require('express');
const router = express.Router();
const { authenticate, authorizeRole } = require('../middleware/auth');
const Job = require('../models/Job');
const Bid = require('../models/Bid');

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

    // Update Bid status
    bid.status = 'Accepted';
    await bid.save();

    // Update Job status
    job.status = 'Contracted';
    await job.save();

    // Reject other bids for this job
    await Bid.updateMany(
        { job: job._id, _id: { $ne: bid._id } },
        { status: 'Rejected' }
    );

    res.json({ message: 'Bid accepted and contract formed', bid, job });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
