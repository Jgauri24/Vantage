const express = require('express');
const router = express.Router();
const Message = require('../models/Message');
const { authenticate } = require('../middleware/auth');

const Job = require('../models/Job');
const Bid = require('../models/Bid');



router.get('/:jobId/:otherUserId', authenticate, async (req, res) => {
    try {
        const { jobId, otherUserId } = req.params;
        const currentUserId = req.user.id;

        const job = await Job.findById(jobId);
        if (!job) return res.status(404).json({ error: 'Job not found' });

 
        const isClient = job.client.toString() === currentUserId;
        
        // Check if other user is a provider who bid
        const otherUserBid = await Bid.findOne({
            job: jobId,
            provider: otherUserId,
            status: { $in: ['Pending', 'Accepted'] }
        });

        // Check if current user is a provider who bid
        const currentUserBid = await Bid.findOne({
            job: jobId,
            provider: currentUserId,
            status: { $in: ['Pending', 'Accepted'] }
        });

        // Check if other user is the client
        const otherIsClient = job.client.toString() === otherUserId;


        const canChat = (isClient && otherUserBid) || (currentUserBid && otherIsClient);
        
        if (!canChat) {
            return res.status(403).json({ error: 'Access denied. You are not authorized to chat with this user.' });
        }

        // Get messages where sender is current user and recipient is other, or vice versa
        const messages = await Message.find({
            job: jobId,
            $or: [
                { sender: currentUserId, recipient: otherUserId },
                { sender: otherUserId, recipient: currentUserId }
            ]
        })
            .populate('sender', 'name role')
            .populate('recipient', 'name role')
            .sort({ createdAt: 1 });
        
        res.json(messages);

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server Error' });
    }
});

module.exports = router;
