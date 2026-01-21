const mongoose = require('mongoose');

const jobSchema = new mongoose.Schema({
  client: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true,
    trim: true
  },
  category: {
    type: String,
    required: true,
    enum: ['Legal', 'Financial', 'Technology', 'Consulting', 'Other']
  },
  budget: {
    type: Number,
    required: true
  },
  location: {
    type: String, // e.g., "Remote" or "New York, NY"
    default: 'Remote'
  },
  status: {
    type: String,
    enum: ['Open', 'Contracted', 'In-Progress', 'Reviewing', 'Completed', 'Cancelled'],
    default: 'Open'
  },
  workSubmission: {
    fileUrl: String,
    fileName: String,
    submittedAt: Date
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Job', jobSchema);
