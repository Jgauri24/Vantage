const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const User = require('../models/User');
const Job = require('../models/Job');
const Bid = require('../models/Bid');


router.get('/me', authenticate, async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-password');
        res.json(user);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});



router.get('/analytics', authenticate, async (req, res) => {
    try {
        const userId = req.user.id;
        const role = req.user.role;
        
        let stats = {
            totalCompleted: 0,
            monetaryValue: 0,
            activeCount: 0
        };

        if (role === 'Provider') {
            const acceptedBids = await Bid.find({ 
                provider: userId, 
                status: 'Accepted'
            }).populate('job');

            acceptedBids.forEach(bid => {
                if (bid.job) {
                    if (bid.job.status === 'Completed') {
                        stats.totalCompleted++;
                        stats.monetaryValue += (bid.job.budget || 0);
                    } else if (['Contracted', 'In-Progress', 'Reviewing'].includes(bid.job.status)) {
                        stats.activeCount++;
                    }
                }
            });
        } else if (role === 'Client') {
            const myJobs = await Job.find({ client: userId });
            
            myJobs.forEach(job => {
                if (job.status === 'Completed') {
                    stats.totalCompleted++;
                    stats.monetaryValue += (job.budget || 0);
                } else if (['Open', 'Contracted', 'In-Progress', 'Reviewing'].includes(job.status)) {
                    stats.activeCount++;
                }
            });
        }

        res.json(stats);
    } catch (error) {
        console.error("Analytics error:", error);
        res.status(500).json({ error: error.message });
    }
});

router.get('/:id', authenticate, async (req, res) => {
    try {
        const user = await User.findById(req.params.id).select('-password');
        if (!user) return res.status(404).json({ error: 'User not found' });
        res.json(user);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Update profile
router.patch('/profile', authenticate, async (req, res) => {
    try {
        const updates = Object.keys(req.body);
        const allowedUpdates = [
            'name',
            'company',
            'bio',
            'skills',
            'hourlyRate',
            'location',
            'walletBalance', // in production this should not be client-editable
            'headline',
            'yearsOfExperience',
            'experience',
            'portfolioLinks'
        ];
        const isValidOperation = updates.every((update) => allowedUpdates.includes(update));

        if (!isValidOperation) {
            return res.status(400).json({ error: 'Invalid updates!' });
        }

        const user = await User.findById(req.user.id);
        if (!user) return res.status(404).json({ error: 'User not found' });

        updates.forEach((update) => user[update] = req.body[update]);
        await user.save();

        res.json(user);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Fund wallet
router.post('/fund-wallet', authenticate, async (req, res) => {
    try {
        const { amount } = req.body;
        if (!amount || amount <= 0) {
            return res.status(400).json({ error: 'Invalid amount' });
        }

        const user = await User.findById(req.user.id);
        if (!user) return res.status(404).json({ error: 'User not found' });

        user.walletBalance = (user.walletBalance || 0) + Number(amount);
        await user.save();

        res.json({ message: 'Wallet funded successfully', walletBalance: user.walletBalance });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
