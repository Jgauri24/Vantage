const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
    job: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Job',
        required: true
    },
    sender: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    recipient: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    content: {
        type: String,
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Create a unique conversation ID based on job, sender, and recipient (sorted)
messageSchema.virtual('conversationId').get(function() {
    const participants = [this.sender.toString(), this.recipient.toString()].sort();
    return `${this.job.toString()}_${participants.join('_')}`;
});

module.exports = mongoose.model('Message', messageSchema);
