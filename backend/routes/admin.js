const express = require('express');
const router = express.Router();
const { authenticate, authorizeRole } = require('../middleware/auth');
const User = require('../models/User');
const Job = require('../models/Job');
const Bid = require('../models/Bid');
const Transaction = require('../models/Transaction');


router.use(authenticate);
router.use(async (req, res, next) => {
    try {

        const user = await User.findById(req.user.id);
        
        if (!user) {
            return res.status(403).json({ error: 'User not found.' });
        }
        
        if (user.role !== 'Admin') {
            return res.status(403).json({ 
                error: 'Access forbidden. Admin role required.',
                hint: 'Your account role is: ' + user.role + '. Please log out and log back in if your role was recently changed.'
            });
        }
        
        // Update req.user with fresh data from database
        req.user.role = user.role;
        next();
    } catch (error) {
        console.error('Admin middleware error:', error);
        res.status(500).json({ error: 'Server error during authorization check.' });
    }
});

// Get platform overview stats
router.get('/overview', async (req, res) => {
    try {
        const totalUsers = await User.countDocuments();
        const totalClients = await User.countDocuments({ role: 'Client' });
        const totalProviders = await User.countDocuments({ role: 'Provider' });
        const totalJobs = await Job.countDocuments();
        const openJobs = await Job.countDocuments({ status: 'Open' });
        const completedJobs = await Job.countDocuments({ status: 'Completed' });
        const totalBids = await Bid.countDocuments();
        const totalTransactions = await Transaction.countDocuments();
        
        // Calculate total platform volume
        const completedJobsData = await Job.find({ status: 'Completed' });
        const totalVolume = completedJobsData.reduce((sum, job) => sum + (job.budget || 0), 0);
        
        res.json({
            users: {
                total: totalUsers,
                clients: totalClients,
                providers: totalProviders
            },
            jobs: {
                total: totalJobs,
                open: openJobs,
                completed: completedJobs
            },
            bids: {
                total: totalBids
            },
            transactions: {
                total: totalTransactions
            },
            platform: {
                totalVolume: totalVolume
            }
        });
    } catch (error) {
        console.error('Admin overview error:', error);
        res.status(500).json({ error: error.message });
    }
});

// Get all users with pagination
router.get('/users', async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const skip = (page - 1) * limit;
        const role = req.query.role; 
        
        const query = role ? { role } : {};
        
        const users = await User.find(query)
            .select('-password')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);
        
        const total = await User.countDocuments(query);
        
        res.json({
            users,
            pagination: {
                page,
                limit,
                total,
                pages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        console.error('Admin get users error:', error);
        res.status(500).json({ error: error.message });
    }
});

// Get user by ID
router.get('/users/:id', async (req, res) => {
    try {
        const user = await User.findById(req.params.id).select('-password');
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        res.json(user);
    } catch (error) {
        console.error('Admin get user error:', error);
        res.status(500).json({ error: error.message });
    }
});

// Update user (admin can update any user)
router.patch('/users/:id', async (req, res) => {
    try {
        const updates = Object.keys(req.body);
        const allowedUpdates = ['name', 'email', 'role', 'company', 'bio', 'location', 'walletBalance'];
        const isValidOperation = updates.every((update) => allowedUpdates.includes(update));
        
        if (!isValidOperation) {
            return res.status(400).json({ error: 'Invalid updates!' });
        }
        
        const user = await User.findById(req.params.id);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        
        updates.forEach((update) => {
            if (update === 'walletBalance' && req.body[update] !== undefined) {
                user[update] = Number(req.body[update]);
            } else {
                user[update] = req.body[update];
            }
        });
        
        await user.save();
        res.json(user);
    } catch (error) {
        console.error('Admin update user error:', error);
        res.status(400).json({ error: error.message });
    }
});

// Delete user
router.delete('/users/:id', async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        
        // Prevent deleting yourself
        if (user._id.toString() === req.user.id) {
            return res.status(400).json({ error: 'Cannot delete your own account' });
        }
        
        await User.deleteOne({ _id: req.params.id });
        res.json({ message: 'User deleted successfully' });
    } catch (error) {
        console.error('Admin delete user error:', error);
        res.status(500).json({ error: error.message });
    }
});

// Get all jobs with pagination
router.get('/jobs', async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const skip = (page - 1) * limit;
        const status = req.query.status; // Optional filter by status
        
        const query = status ? { status } : {};
        
        const jobs = await Job.find(query)
            .populate('client', 'name email company')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);
        
        const total = await Job.countDocuments(query);
        
        res.json({
            jobs,
            pagination: {
                page,
                limit,
                total,
                pages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        console.error('Admin get jobs error:', error);
        res.status(500).json({ error: error.message });
    }
});

// Get job by ID
router.get('/jobs/:id', async (req, res) => {
    try {
        const job = await Job.findById(req.params.id)
            .populate('client', 'name email company')
            .populate('transactionIds');
        
        if (!job) {
            return res.status(404).json({ error: 'Job not found' });
        }
        
        // Get bids for this job
        const bids = await Bid.find({ job: job._id })
            .populate('provider', 'name email');
        
        res.json({ job, bids });
    } catch (error) {
        console.error('Admin get job error:', error);
        res.status(500).json({ error: error.message });
    }
});

// Update job status (admin can change any job status)
router.patch('/jobs/:id/status', async (req, res) => {
    try {
        const { status } = req.body;
        const validStatuses = ['Open', 'Contracted', 'In-Progress', 'Reviewing', 'Completed'];
        
        if (!validStatuses.includes(status)) {
            return res.status(400).json({ error: 'Invalid status' });
        }
        
        const job = await Job.findById(req.params.id);
        if (!job) {
            return res.status(404).json({ error: 'Job not found' });
        }
        
        job.status = status;
        await job.save();
        
        res.json(job);
    } catch (error) {
        console.error('Admin update job status error:', error);
        res.status(500).json({ error: error.message });
    }
});

// Delete job
router.delete('/jobs/:id', async (req, res) => {
    try {
        const job = await Job.findById(req.params.id);
        if (!job) {
            return res.status(404).json({ error: 'Job not found' });
        }
        
        // Delete associated bids
        await Bid.deleteMany({ job: job._id });
        
        await Job.deleteOne({ _id: req.params.id });
        res.json({ message: 'Job deleted successfully' });
    } catch (error) {
        console.error('Admin delete job error:', error);
        res.status(500).json({ error: error.message });
    }
});

// Get all transactions
router.get('/transactions', async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 50;
        const skip = (page - 1) * limit;
        
        const transactions = await Transaction.find()
            .populate('user', 'name email role')
            .populate('relatedJob', 'title')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);
        
        const total = await Transaction.countDocuments();
        
        res.json({
            transactions,
            pagination: {
                page,
                limit,
                total,
                pages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        console.error('Admin get transactions error:', error);
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
