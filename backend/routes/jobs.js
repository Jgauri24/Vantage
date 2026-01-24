const express = require('express');
const router = express.Router();
const Job = require('../models/Job');
const Bid = require('../models/Bid');
const { authenticate, authorizeRole } = require('../middleware/auth');


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
      if (status) {
        query.status = status;
      } else {
        query.status = { $in: ['Open', 'Contracted'] };
      }
    } else if (req.user.role === 'Admin') {

      if (status) {
        query.status = status;
      }
    }

    if (category) query.category = category;

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

    if (req.user.role === 'Client' && job.client.toString() !== req.user.id) {
        return res.status(403).json({ error: 'Access denied' });
    }

    
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



const upload = require('../middleware/upload');
const User = require('../models/User');



// Submit work (Provider only) - now with file upload
router.patch('/:id/submit', authenticate, authorizeRole('Provider'), upload.single('workFile'), async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) return res.status(404).json({ error: 'Job not found' });

    const acceptedBid = await Bid.findOne({ job: job._id, provider: req.user.id, status: 'Accepted' });
    if (!acceptedBid) {
        return res.status(403).json({ error: 'Access denied. You are not the contracted provider.' });
    }

    if (job.status !== 'Contracted' && job.status !== 'In-Progress') {
        return res.status(400).json({ error: 'Job is not in a state to be submitted.' });
    }

    if (!req.file) {
        return res.status(400).json({ error: 'Please upload a work file (PDF or Image).' });
    }

    const fullUrl = req.protocol + '://' + req.get('host') + '/uploads/' + req.file.filename;

    job.status = 'Reviewing';
    job.workSubmission = {
        fileUrl: fullUrl,
        fileName: req.file.originalname,
        submittedAt: Date.now()
    };
    
    await job.save();

    res.json(job);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Approve work (Client only) - Half or Full payment
router.patch('/:id/approve', authenticate, authorizeRole('Client'), async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) return res.status(404).json({ error: 'Job not found' });

    if (job.client.toString() !== req.user.id) {
        return res.status(403).json({ error: 'Access denied.' });
    }

    if (job.status !== 'Reviewing') {
     return res.status(400).json({ error: 'Job is not checking for approval.' });
    }


    const acceptedBid = await Bid.findOne({ job: job._id, status: 'Accepted' });
    if (!acceptedBid) {
        return res.status(400).json({ error: 'No accepted bid found.' });
    }

    const provider = await User.findById(acceptedBid.provider);
    if (!provider) {
        return res.status(404).json({ error: 'Provider not found.' });
    }

    const Transaction = require('../models/Transaction');
    let releaseAmount = 0;
    let isFinal = false;

    // Determine payment stage
    if (job.amountPaid === 0 || !job.amountPaid) {
        // First approval: Pay 50%
        releaseAmount = job.budget * 0.5;
        job.amountPaid = releaseAmount;
        job.status = 'In-Progress'; 
    } else {
        // Final approval: Pay Remainder
        releaseAmount = job.budget - job.amountPaid;
        job.amountPaid += releaseAmount;
        job.status = 'Completed';
        job.paymentReleased = true;
        isFinal = true;
    }

    // Check Client Wallet Balance
    const client = await User.findById(req.user.id);
    if (!client.walletBalance || client.walletBalance < releaseAmount) {
        return res.status(402).json({ 
            error: 'Insufficient funds for approval.',
            required: releaseAmount,
            current: client.walletBalance || 0
        });
    }

    // Deduct from Client
    client.walletBalance -= releaseAmount;
    await client.save();

    // Create Client Transaction (Payment)
    const clientTransaction = new Transaction({
        user: client._id,
        type: 'job_payment',
        amount: -releaseAmount,
        balanceAfter: client.walletBalance,
        relatedJob: job._id,
        status: 'completed',
        description: `Payment for job: ${job.title} (${isFinal ? 'Final' : 'Partial'})`
    });
    await clientTransaction.save();

    // Credit Provider
    provider.walletBalance = (provider.walletBalance || 0) + releaseAmount;
    await provider.save();

    // Create Provider Transaction (Earning)
    const providerTransaction = new Transaction({
        user: provider._id,
        type: 'job_earning',
        amount: releaseAmount,
        balanceAfter: provider.walletBalance,
        relatedJob: job._id,
        status: 'completed',
        description: `Earned from job: ${job.title} (${isFinal ? 'Final' : 'Partial'} Payment)`
    });
    await providerTransaction.save();

    job.transactionIds.push(clientTransaction._id, providerTransaction._id);
    await job.save();

    res.json({ 
        job, 
        released: releaseAmount, 
        isFinal,
        message: isFinal ? 'Job completed. Full payment released.' : '50% payment released. Job active for final submission.'
    });

  } catch (error) {
    console.error('Job approval error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Reject work (Client only)
router.patch('/:id/reject', authenticate, authorizeRole('Client'), async (req, res) => {
    try {
        const job = await Job.findById(req.params.id);
        if (!job) return res.status(404).json({ error: 'Job not found' });

        if (job.client.toString() !== req.user.id) {
            return res.status(403).json({ error: 'Access denied.' });
        }

        if (job.status !== 'Reviewing') {
            return res.status(400).json({ error: 'Job is not under review.' });
        }

        job.status = 'In-Progress';
        await job.save();

        res.json({ job, message: 'Work rejected. Provider can re-submit.' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Delete job (Client only)
router.delete('/:id', authenticate, authorizeRole('Client'), async (req, res) => {
    try {
        const job = await Job.findById(req.params.id);
        if (!job) return res.status(404).json({ error: 'Job not found' });

        if (job.client.toString() !== req.user.id) {
            return res.status(403).json({ error: 'Access denied.' });
        }

        if (['Contracted', 'In-Progress', 'Reviewing', 'Completed'].includes(job.status)) {
            return res.status(400).json({ error: 'Cannot delete an active or completed engagement.' });
        }


        
        await Job.deleteOne({ _id: job._id });
        
        
        const Bid = require('../models/Bid');
        await Bid.deleteMany({ job: job._id });

        res.json({ message: 'Job deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
