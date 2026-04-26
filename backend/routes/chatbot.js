const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const User = require('../models/User');
const Job = require('../models/Job');
const Bid = require('../models/Bid');
const Transaction = require('../models/Transaction');

// ─── Intent Classification Engine ───────────────────────────────────────
const INTENTS = {
  GREETING: { patterns: ['hello', 'hi', 'hey', 'good morning', 'good evening', 'howdy', 'sup', 'whats up', "what's up", 'greetings'], priority: 1 },
  MY_JOBS: { patterns: ['my jobs', 'my engagements', 'my postings', 'jobs i posted', 'show jobs', 'list jobs', 'active jobs', 'my contracts', 'my work', 'current jobs', 'open jobs'], priority: 2 },
  JOB_STATUS: { patterns: ['job status', 'status of', 'how is my job', 'progress', 'whats happening with', 'update on', 'check status'], priority: 3 },
  MY_BIDS: { patterns: ['my bids', 'my proposals', 'bids i placed', 'show bids', 'bid status', 'proposals', 'pending bids', 'accepted bids'], priority: 2 },
  WALLET: { patterns: ['wallet', 'balance', 'funds', 'money', 'how much', 'earnings', 'credit', 'payment', 'wallet balance', 'my balance', 'available funds'], priority: 2 },
  ANALYTICS: { patterns: ['analytics', 'stats', 'statistics', 'performance', 'how am i doing', 'my numbers', 'metrics', 'report', 'summary', 'overview', 'dashboard stats'], priority: 2 },
  FIND_JOBS: { patterns: ['find jobs', 'search jobs', 'browse jobs', 'available jobs', 'open opportunities', 'marketplace', 'looking for work', 'find work', 'job openings', 'new jobs'], priority: 2 },
  FIND_PROVIDERS: { patterns: ['find provider', 'find freelancer', 'hire', 'looking for', 'need someone', 'find expert', 'top providers', 'best rated', 'recommend provider'], priority: 2 },
  HOW_TO_POST: { patterns: ['how to post', 'create job', 'post a job', 'new job', 'how do i post', 'posting a job', 'create engagement'], priority: 3 },
  HOW_TO_BID: { patterns: ['how to bid', 'place a bid', 'submit proposal', 'how do i bid', 'bidding', 'apply for job', 'how to apply'], priority: 3 },
  HOW_PAYMENTS: { patterns: ['how payments work', 'payment process', 'escrow', 'milestone', 'pay after demo', 'payment flow', 'how do i pay', 'get paid', 'how to get paid'], priority: 3 },
  TRANSACTIONS: { patterns: ['transactions', 'transaction history', 'payment history', 'recent payments', 'spending', 'earnings history'], priority: 2 },
  PLATFORM_HELP: { patterns: ['help', 'how does', 'what is vantage', 'about platform', 'features', 'what can i do', 'guide', 'how to use', 'tutorial', 'getting started'], priority: 1 },
  CATEGORY_JOBS: { patterns: ['technology jobs', 'design jobs', 'legal jobs', 'finance jobs', 'data science jobs', 'tech jobs', 'jobs in'], priority: 3 },
  THANKS: { patterns: ['thanks', 'thank you', 'appreciate', 'great', 'awesome', 'perfect', 'cool', 'nice'], priority: 1 },
  GOODBYE: { patterns: ['bye', 'goodbye', 'see you', 'later', 'gotta go', 'exit', 'close'], priority: 1 },
};

function classifyIntent(message) {
  const lower = message.toLowerCase().trim();
  let bestMatch = { intent: 'UNKNOWN', score: 0 };

  for (const [intent, config] of Object.entries(INTENTS)) {
    for (const pattern of config.patterns) {
      if (lower.includes(pattern)) {
        const score = pattern.length * config.priority;
        if (score > bestMatch.score) {
          bestMatch = { intent, score };
        }
      }
    }
  }
  return bestMatch.intent;
}

function extractCategory(message) {
  const lower = message.toLowerCase();
  const categories = ['technology', 'design', 'legal', 'finance', 'data science'];
  return categories.find(c => lower.includes(c)) || null;
}

function formatCurrency(amount) {
  return '$' + (amount || 0).toLocaleString('en-US', { minimumFractionDigits: 0 });
}

// ─── Intent Handlers ────────────────────────────────────────────────────

async function handleGreeting(user) {
  const hour = new Date().getHours();
  const timeGreeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';
  return {
    message: `${timeGreeting}, ${user.name}! 👋 I'm your Vantage AI assistant. I can help you with:\n\n• **Your jobs & contracts** — check status, browse listings\n• **Wallet & payments** — view balance, transaction history\n• **Analytics** — your performance metrics\n• **Platform guidance** — how to post jobs, bid, payments\n\nWhat would you like to know?`,
    suggestions: user.role === 'Client'
      ? ['Show my jobs', 'Wallet balance', 'My analytics']
      : ['My bids', 'Find jobs', 'My earnings']
  };
}

async function handleMyJobs(user) {
  if (user.role === 'Client') {
    const jobs = await Job.find({ client: user._id }).sort({ createdAt: -1 }).limit(10);
    if (jobs.length === 0) {
      return { message: "You haven't posted any jobs yet. Head to **Post Job** to create your first engagement!", suggestions: ['How to post a job', 'Browse marketplace'] };
    }
    const statusCounts = {};
    jobs.forEach(j => { statusCounts[j.status] = (statusCounts[j.status] || 0) + 1; });
    const summary = Object.entries(statusCounts).map(([s, c]) => `• **${s}**: ${c}`).join('\n');
    const jobList = jobs.slice(0, 5).map(j => `  → *${j.title}* — ${j.status} (${formatCurrency(j.budget)})`).join('\n');
    return {
      message: `📋 **Your Jobs** (${jobs.length} total)\n\n${summary}\n\n**Recent:**\n${jobList}`,
      suggestions: ['Job details', 'Analytics', 'Wallet balance']
    };
  } else {
    const bids = await Bid.find({ provider: user._id, status: 'Accepted' }).populate('job');
    const activeJobs = bids.filter(b => b.job && ['Contracted', 'In-Progress', 'Reviewing'].includes(b.job.status));
    if (activeJobs.length === 0) {
      return { message: "You don't have any active contracts right now. Browse the **Marketplace** to find opportunities!", suggestions: ['Find jobs', 'My bids'] };
    }
    const jobList = activeJobs.map(b => `  → *${b.job.title}* — ${b.job.status} (${formatCurrency(b.job.budget)})`).join('\n');
    return {
      message: `🔧 **Your Active Contracts** (${activeJobs.length})\n\n${jobList}`,
      suggestions: ['My bids', 'My earnings', 'Find more jobs']
    };
  }
}

async function handleMyBids(user) {
  if (user.role !== 'Provider') {
    return { message: "Bids are for Provider accounts. As a Client, you can **review bids** on your posted jobs.", suggestions: ['Show my jobs'] };
  }
  const bids = await Bid.find({ provider: user._id }).populate('job', 'title status budget').sort({ createdAt: -1 }).limit(10);
  if (bids.length === 0) {
    return { message: "You haven't placed any bids yet. Visit the **Marketplace** to find jobs and submit proposals!", suggestions: ['Find jobs', 'How to bid'] };
  }
  const statusCounts = {};
  bids.forEach(b => { statusCounts[b.status] = (statusCounts[b.status] || 0) + 1; });
  const summary = Object.entries(statusCounts).map(([s, c]) => `• **${s}**: ${c}`).join('\n');
  const bidList = bids.slice(0, 5).map(b => `  → *${b.job?.title || 'Unknown'}* — Bid: ${formatCurrency(b.amount)} (${b.status})`).join('\n');
  return {
    message: `📝 **Your Proposals** (${bids.length} total)\n\n${summary}\n\n**Recent:**\n${bidList}`,
    suggestions: ['Find more jobs', 'My contracts', 'Analytics']
  };
}

async function handleWallet(user) {
  const freshUser = await User.findById(user._id);
  const recentTx = await Transaction.find({ user: user._id }).sort({ createdAt: -1 }).limit(5);
  let txList = '';
  if (recentTx.length > 0) {
    txList = '\n\n**Recent Activity:**\n' + recentTx.map(t => {
      const sign = t.amount >= 0 ? '+' : '';
      return `  → ${sign}${formatCurrency(t.amount)} — ${t.description}`;
    }).join('\n');
  }
  return {
    message: `💰 **Wallet Balance**: ${formatCurrency(freshUser.walletBalance)}${txList}`,
    suggestions: user.role === 'Client' ? ['Add funds', 'Transaction history', 'My jobs'] : ['Transaction history', 'Find jobs']
  };
}

async function handleAnalytics(user) {
  if (user.role === 'Provider') {
    const bids = await Bid.find({ provider: user._id }).populate('job');
    const accepted = bids.filter(b => b.status === 'Accepted');
    const completed = accepted.filter(b => b.job?.status === 'Completed');
    const totalEarned = completed.reduce((sum, b) => sum + (b.job?.budget || 0), 0);
    const successRate = bids.length > 0 ? Math.round((accepted.length / bids.length) * 100) : 0;
    return {
      message: `📊 **Your Performance**\n\n• **Total Bids**: ${bids.length}\n• **Accepted**: ${accepted.length}\n• **Completed Jobs**: ${completed.length}\n• **Success Rate**: ${successRate}%\n• **Total Earned**: ${formatCurrency(totalEarned)}`,
      suggestions: ['My contracts', 'Find jobs', 'Wallet']
    };
  } else {
    const jobs = await Job.find({ client: user._id });
    const completed = jobs.filter(j => j.status === 'Completed');
    const totalSpent = completed.reduce((sum, j) => sum + (j.budget || 0), 0);
    const active = jobs.filter(j => ['Open', 'Contracted', 'In-Progress', 'Reviewing'].includes(j.status));
    return {
      message: `📊 **Your Activity**\n\n• **Total Jobs Posted**: ${jobs.length}\n• **Active**: ${active.length}\n• **Completed**: ${completed.length}\n• **Total Spent**: ${formatCurrency(totalSpent)}`,
      suggestions: ['My jobs', 'Post a job', 'Wallet']
    };
  }
}

async function handleFindJobs(user, message) {
  const category = extractCategory(message);
  const query = { status: 'Open' };
  if (category) query.category = new RegExp(category, 'i');

  const jobs = await Job.find(query).populate('client', 'name company').sort({ createdAt: -1 }).limit(8);
  if (jobs.length === 0) {
    return { message: category ? `No open ${category} jobs right now. Check back soon!` : "No open jobs at the moment.", suggestions: ['My bids', 'Analytics'] };
  }
  const jobList = jobs.map(j => `  → **${j.title}**\n    ${formatCurrency(j.budget)} · ${j.category} · ${j.location || 'Remote'}`).join('\n\n');
  return {
    message: `🔍 **Open Opportunities** ${category ? `in ${category}` : ''} (${jobs.length})\n\n${jobList}\n\nVisit the **Marketplace** page for full details and to submit proposals.`,
    suggestions: ['How to bid', 'Technology jobs', 'Design jobs']
  };
}

async function handleTransactions(user) {
  const txs = await Transaction.find({ user: user._id }).sort({ createdAt: -1 }).limit(8);
  if (txs.length === 0) {
    return { message: "No transactions yet.", suggestions: ['Wallet balance', 'My jobs'] };
  }
  const txList = txs.map(t => {
    const sign = t.amount >= 0 ? '+' : '';
    const date = new Date(t.createdAt).toLocaleDateString();
    return `  → ${date} — ${sign}${formatCurrency(t.amount)} — ${t.description}`;
  }).join('\n');
  return {
    message: `📄 **Recent Transactions**\n\n${txList}`,
    suggestions: ['Wallet balance', 'Analytics']
  };
}

function handleHowToPost() {
  return {
    message: `📌 **How to Post a Job**\n\n1. Go to **Dashboard** → click **Post Job**\n2. Fill in the title, description, category, and budget\n3. Your job goes live on the Marketplace immediately\n4. Providers will submit proposals with rates & cover letters\n5. Review bids, accept the best one, and the engagement begins!\n\n💡 *Tip: Detailed descriptions attract better proposals.*`,
    suggestions: ['How payments work', 'My jobs', 'Find providers']
  };
}

function handleHowToBid() {
  return {
    message: `📌 **How to Submit a Proposal**\n\n1. Browse the **Marketplace** for open jobs\n2. Click a job to view full details\n3. Enter your proposed rate and a compelling cover letter\n4. Submit — the client will review all proposals\n5. If accepted, the engagement begins and you can start work!\n\n💡 *Tip: Customize each proposal. Generic bids rarely win.*`,
    suggestions: ['Find jobs', 'My bids', 'How payments work']
  };
}

function handlePayments() {
  return {
    message: `💳 **Vantage Payment Flow (Pay-After-Demo)**\n\n1. **Client posts job** with a budget\n2. **Provider submits work** (files/demos)\n3. **First Approval** → Client releases **50%** of budget\n4. Provider continues work → submits final deliverable\n5. **Final Approval** → Client releases remaining **50%**\n6. Job marked **Completed** ✅\n\n🔒 *Funds are deducted from the Client's wallet and credited to the Provider's wallet automatically.*`,
    suggestions: ['Wallet balance', 'My jobs', 'Transactions']
  };
}

function handlePlatformHelp(user) {
  return {
    message: `🏛️ **Welcome to Vantage**\n\nVantage is a premium service marketplace for high-end professional engagements.\n\n**As a ${user.role}**, you can:\n${user.role === 'Client' ? '• Post jobs with budgets\n• Review provider proposals\n• Approve work & release payments\n• Track spending & analytics' : '• Browse open opportunities\n• Submit proposals with rates\n• Upload work deliverables\n• Track earnings & performance'}\n\n**Key Features:**\n• 🔒 Secure milestone payments\n• 💬 Real-time chat per engagement\n• 📊 Performance analytics\n• 👛 Built-in wallet system`,
    suggestions: user.role === 'Client'
      ? ['How to post a job', 'How payments work', 'My jobs']
      : ['How to bid', 'Find jobs', 'How payments work']
  };
}

function handleThanks() {
  const responses = [
    "You're welcome! Let me know if you need anything else. 😊",
    "Happy to help! Anything else I can assist with?",
    "Glad I could help! Feel free to ask more anytime."
  ];
  return { message: responses[Math.floor(Math.random() * responses.length)], suggestions: ['My jobs', 'Analytics', 'Help'] };
}

function handleGoodbye(user) {
  return { message: `See you later, ${user.name}! Have a great day. 👋`, suggestions: [] };
}

function handleUnknown() {
  return {
    message: "I'm not sure I understand. I can help you with:\n\n• **Jobs** — \"show my jobs\", \"find jobs\"\n• **Bids** — \"my bids\", \"how to bid\"\n• **Wallet** — \"wallet balance\", \"transactions\"\n• **Analytics** — \"my stats\", \"performance\"\n• **Help** — \"how payments work\", \"getting started\"\n\nTry asking one of these!",
    suggestions: ['My jobs', 'Wallet balance', 'Help']
  };
}

// ─── Main Chat Endpoint ─────────────────────────────────────────────────
router.post('/', authenticate, async (req, res) => {
  try {
    const { message } = req.body;
    if (!message || !message.trim()) {
      return res.status(400).json({ error: 'Message is required' });
    }

    const user = await User.findById(req.user.id).select('-password');
    if (!user) return res.status(404).json({ error: 'User not found' });

    const intent = classifyIntent(message);
    let response;

    switch (intent) {
      case 'GREETING': response = await handleGreeting(user); break;
      case 'MY_JOBS': case 'JOB_STATUS': response = await handleMyJobs(user); break;
      case 'MY_BIDS': response = await handleMyBids(user); break;
      case 'WALLET': response = await handleWallet(user); break;
      case 'ANALYTICS': response = await handleAnalytics(user); break;
      case 'FIND_JOBS': case 'CATEGORY_JOBS': response = await handleFindJobs(user, message); break;
      case 'FIND_PROVIDERS': response = await handleFindJobs(user, message); break;
      case 'HOW_TO_POST': response = handleHowToPost(); break;
      case 'HOW_TO_BID': response = handleHowToBid(); break;
      case 'HOW_PAYMENTS': response = handlePayments(); break;
      case 'TRANSACTIONS': response = await handleTransactions(user); break;
      case 'PLATFORM_HELP': response = handlePlatformHelp(user); break;
      case 'THANKS': response = handleThanks(); break;
      case 'GOODBYE': response = handleGoodbye(user); break;
      default: response = handleUnknown();
    }

    res.json({
      intent,
      ...response,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Chatbot error:', error);
    res.status(500).json({ error: 'Something went wrong. Please try again.' });
  }
});

module.exports = router;
