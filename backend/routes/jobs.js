const express = require('express');
const router = express.Router();
const Job = require('../models/Job');
const Bid = require('../models/Bid');
const { authenticate, authorizeRole } = require('../middleware/auth');

// Create a new job (Client only)
router.post('/', authenticate, authorizeRole('Client'), async (req, res) => {
  try {
    const { title, description, category, budget, location } = req.body;
    
    const job = new Job({
      client: req.user.id,
      title,
      description,
      category,
      budget,
      location
    });

    await job.save();
    res.status(201).json(job);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});


router.get('/', authenticate, async (req, res) => {
  try {
    const { category, status } = req.query;
    let query = {};
    

    
    if (req.user.role === 'Client') {
      query.client = req.user.id;
    } else if (req.user.role === 'Provider') {
      query.status = { $in: ['Open', 'Contracted'] };
    } else if (req.user.role === 'Admin') {
      // Admin sees everything
    }

    if (category) query.category = category;
    if (status) query.status = status;

    const jobs = await Job.find(query)
      .populate('client', 'name company')
      .sort({ createdAt: -1 });

    res.json(jobs);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get single job details
router.get('/:id', authenticate, async (req, res) => {
  try {
    const job = await Job.findById(req.params.id).populate('client', 'name company');
    if (!job) return res.status(404).json({ error: 'Job not found' });

    
    res.json(job);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});


router.get('/:id/bids', authenticate, async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) return res.status(404).json({ error: 'Job not found' });

    // Authorization: Only the client who posted the job can view bids
    if (req.user.role === 'Client' && job.client.toString() !== req.user.id) {
        return res.status(403).json({ error: 'Access denied' });
    }
    // Providers shouldn't see other bids usually, or maybe they can? For now, let's restrict to Client.
    // Actually, let's allow Providers to see bids if we want a transparent marketplace, but usually it's hidden.
    // Let's stick to Client only for now as per plan.
    
    if (req.user.role === 'Provider') {
         return res.status(403).json({ error: 'Access denied. Only the job poster can view bids.' });
    }

    const bids = await Bid.find({ job: req.params.id })
      .populate('provider', 'name email')
      .sort({ amount: 1 }); // Lowest bid first

    res.json(bids);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/:id/bids', authenticate, authorizeRole('Provider'), async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) return res.status(404).json({ error: 'Job not found' });
    if (job.status !== 'Open') return res.status(400).json({ error: 'Job is not open for bidding' });


    const existingBid = await Bid.findOne({ job: job._id, provider: req.user.id });
    if (existingBid) return res.status(400).json({ error: 'You have already placed a bid for this job' });

    const { amount, proposal } = req.body;
    
    const bid = new Bid({
      job: job._id,
      provider: req.user.id,
      amount,
      proposal
    });

    await bid.save();
    res.status(201).json(bid);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

module.exports = router;
