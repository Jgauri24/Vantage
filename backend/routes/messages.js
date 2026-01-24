const express = require('express');
const router = express.Router();
const Message = require('../models/Message');
const { authenticate } = require('../middleware/auth');

const Job = require('../models/Job');
const Bid = require('../models/Bid');


router.get('/:jobId', authenticate, async (req, res) => {
    try {
        const job = await Job.findById(req.params.jobId);
        if (!job) return res.status(404).json({ error: 'Job not found' });

        // Check if user is the Client
        const isClient = job.client.toString() === req.user.id;

        let isProvider = false;
        if (!isClient) {
            const acceptedBid = await Bid.findOne({ 
                job: req.params.jobId, 
                provider: req.user.id,
                status: 'Accepted'
            });
            if (acceptedBid) isProvider = true;
        }

        if (!isClient && !isProvider) {
            return res.status(403).json({ error: 'Access denied. You are not a participant in this job.' });
        }

        const messages = await Message.find({ job: req.params.jobId })
            .populate('sender', 'name role')
            .sort({ createdAt: 1 });
        res.json(messages);

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server Error' });
    }
});

module.exports = router;
