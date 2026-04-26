/**
 * Vantage — Seed Script
 * Seeds the database with realistic demo clients, providers, and premium jobs.
 * Run: node seed.js
 */

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const User = require('./models/User');
const Job = require('./models/Job');
const Bid = require('./models/Bid');

const MONGO_URI = process.env.MONGO_URI;

const seedClients = [
  {
    email: 'alexandra.whitmore@meridiangroup.com',
    password: 'VantageDemo2026',
    name: 'Alexandra Whitmore',
    role: 'Client',
    company: 'Meridian Capital Group',
    location: 'New York, NY',
    walletBalance: 50000,
    bio: 'Managing Director at Meridian Capital Group. Focused on private equity deal origination and portfolio optimization across emerging technology verticals.'
  },
  {
    email: 'raj.nakamura@atlasconsulting.io',
    password: 'VantageDemo2026',
    name: 'Raj Nakamura',
    role: 'Client',
    company: 'Atlas Strategic Consulting',
    location: 'San Francisco, CA',
    walletBalance: 35000,
    bio: 'Partner at Atlas Strategic Consulting. Advising Fortune 100 companies on digital transformation, AI integration, and operational excellence.'
  },
  {
    email: 'elena.marchetti@lumiere.co',
    password: 'VantageDemo2026',
    name: 'Elena Marchetti',
    role: 'Client',
    company: 'Lumière Ventures',
    location: 'London, UK',
    walletBalance: 75000,
    bio: 'Founding Partner at Lumière Ventures. Early-stage investor in luxury tech, fintech, and climate solutions across EMEA.'
  }
];

const seedProviders = [
  {
    email: 'james.holloway@independent.pro',
    password: 'VantageDemo2026',
    name: 'James Holloway',
    role: 'Provider',
    company: 'Holloway & Associates',
    location: 'Austin, TX',
    walletBalance: 12000,
    bio: 'Full-stack architect with 15 years of experience building enterprise platforms. Former engineering lead at Stripe and Palantir.',
    headline: 'Enterprise Architecture & Systems Design',
    skills: ['System Architecture', 'Cloud Infrastructure', 'API Design', 'Node.js', 'React', 'AWS'],
    hourlyRate: 250,
    yearsOfExperience: 15
  },
  {
    email: 'sofia.chen@designstudio.co',
    password: 'VantageDemo2026',
    name: 'Sofia Chen',
    role: 'Provider',
    company: 'Chen Design Studio',
    location: 'Los Angeles, CA',
    walletBalance: 8500,
    bio: 'Award-winning brand strategist and UX designer. Previously at IDEO and Pentagram. Specializing in luxury brand identities and product experiences.',
    headline: 'Brand Strategy & Premium UX Design',
    skills: ['Brand Identity', 'UX/UI Design', 'Design Systems', 'Figma', 'Motion Design', 'User Research'],
    hourlyRate: 200,
    yearsOfExperience: 12
  },
  {
    email: 'marcus.adler@datacraft.ai',
    password: 'VantageDemo2026',
    name: 'Marcus Adler',
    role: 'Provider',
    company: 'DataCraft Intelligence',
    location: 'Berlin, Germany',
    walletBalance: 15000,
    bio: 'Data scientist and ML engineer. PhD in Applied Mathematics from MIT. Building predictive models and AI systems for hedge funds and trading desks.',
    headline: 'Machine Learning & Quantitative Analytics',
    skills: ['Machine Learning', 'Python', 'TensorFlow', 'Data Engineering', 'NLP', 'Financial Modeling'],
    hourlyRate: 300,
    yearsOfExperience: 10
  },
  {
    email: 'priya.sundaram@legaledge.law',
    password: 'VantageDemo2026',
    name: 'Priya Sundaram',
    role: 'Provider',
    company: 'LegalEdge Advisors',
    location: 'Mumbai, India',
    walletBalance: 6000,
    bio: 'Corporate attorney specializing in cross-border M&A, fintech regulation, and intellectual property strategy. Former counsel at Freshfields.',
    headline: 'Corporate Law & M&A Advisory',
    skills: ['Contract Law', 'M&A Due Diligence', 'IP Strategy', 'Regulatory Compliance', 'Fintech Law'],
    hourlyRate: 275,
    yearsOfExperience: 14
  }
];

// Premium seed jobs — realistic, high-end professional engagements
const seedJobsTemplate = [
  {
    title: 'Enterprise API Platform Architecture — Fintech Integration Suite',
    description: 'We need a senior systems architect to design and document a modular API platform connecting our portfolio companies\' payment systems. The platform must handle 10M+ daily transactions, support PCI-DSS compliance, and integrate with Stripe, Plaid, and custom banking APIs.\n\nDeliverables:\n• Full architecture document with system diagrams\n• API specification (OpenAPI 3.1)\n• Infrastructure-as-code templates (Terraform/AWS CDK)\n• Security & compliance audit framework\n• Performance benchmarking strategy',
    category: 'Technology',
    budget: 18000,
    location: 'Remote',
    status: 'Open'
  },
  {
    title: 'Brand Identity Redesign — Luxury Real Estate Portfolio',
    description: 'Complete visual identity overhaul for our luxury real estate division managing $2B+ in assets. The rebrand must convey exclusivity, trust, and modern sophistication while maintaining heritage elements.\n\nScope includes:\n• Logo system (primary, secondary, monogram)\n• Typography & color palette definition\n• Stationery suite (letterhead, business cards, envelopes)\n• Digital style guide & component library\n• Presentation deck templates\n• Property marketing collateral templates',
    category: 'Design',
    budget: 25000,
    location: 'New York, NY',
    status: 'Open'
  },
  {
    title: 'Predictive Market Analysis Engine — Commodities Trading Desk',
    description: 'Build a machine learning pipeline to forecast commodity price movements using alternative data sources (satellite imagery, shipping data, weather patterns). Integration with our Bloomberg Terminal setup is required.\n\nRequirements:\n• Data ingestion pipeline (Python/Spark)\n• Feature engineering framework\n• Ensemble model (LSTM + Gradient Boosting)\n• Real-time inference API\n• Dashboard with P&L attribution\n• Backtesting harness with Sharpe ratio optimization',
    category: 'Data Science',
    budget: 35000,
    location: 'Remote',
    status: 'Open'
  },
  {
    title: 'Cross-Border M&A Due Diligence — Southeast Asia Expansion',
    description: 'Legal counsel needed for due diligence on a $50M acquisition target in Singapore. The target is a Series B fintech company with operations in Singapore, Indonesia, and Vietnam.\n\nScope:\n• Corporate structure analysis\n• Regulatory compliance review (MAS, OJK, SBV)\n• IP portfolio assessment\n• Employment contract review (200+ employees)\n• Tax liability analysis across jurisdictions\n• Risk memo with deal-breaker identification',
    category: 'Legal',
    budget: 45000,
    location: 'Singapore',
    status: 'Open'
  },
  {
    title: 'Executive Dashboard — Portfolio Performance Analytics',
    description: 'Design and develop a real-time executive dashboard for our investment committee. The dashboard must aggregate data from 12 portfolio companies and present KPIs in an elegant, investor-grade format.\n\nFeatures:\n• Real-time data aggregation from REST/GraphQL APIs\n• Interactive charts (revenue, burn rate, ARR, churn)\n• Cohort analysis & benchmarking views\n• PDF/PowerPoint export for board meetings\n• Role-based access (LP view vs GP view)\n• Mobile-responsive design',
    category: 'Technology',
    budget: 22000,
    location: 'Remote',
    status: 'Open'
  },
  {
    title: 'Investor Pitch Deck & Financial Model — Series B Fundraise',
    description: 'We are preparing for a $30M Series B raise and need an elite-quality pitch deck and accompanying financial model. The deck must tell a compelling narrative and the model must withstand institutional investor scrutiny.\n\nDeliverables:\n• 20-slide investor deck (Figma + PowerPoint)\n• 5-year financial model (Excel, fully dynamic)\n• Unit economics deep-dive\n• Market sizing analysis (TAM/SAM/SOM)\n• Competitive landscape mapping\n• Data room organization guide',
    category: 'Finance',
    budget: 15000,
    location: 'San Francisco, CA',
    status: 'Open'
  },
  {
    title: 'AI-Powered Customer Intelligence Platform — Enterprise SaaS',
    description: 'Build an NLP-driven customer intelligence system that analyzes support tickets, NPS surveys, and product reviews to surface actionable insights. Must integrate with Zendesk, Intercom, and Salesforce.\n\nArchitecture:\n• Text classification & sentiment analysis pipeline\n• Topic modeling with BERT embeddings\n• Automated insight report generation\n• Slack/Teams notification system\n• Admin dashboard with trend visualization\n• REST API for third-party consumption',
    category: 'Data Science',
    budget: 28000,
    location: 'Remote',
    status: 'Open'
  },
  {
    title: 'Regulatory Compliance Framework — Digital Asset Exchange',
    description: 'Develop a comprehensive regulatory compliance framework for our digital asset exchange launching across 5 EU jurisdictions under MiCA regulation.\n\nRequirements:\n• MiCA compliance roadmap\n• KYC/AML policy documentation\n• Travel Rule implementation guide\n• Incident response protocols\n• Regulatory reporting templates\n• Staff training curriculum',
    category: 'Legal',
    budget: 38000,
    location: 'London, UK',
    status: 'Open'
  }
];

async function seed() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('✓ Connected to MongoDB');

    // Clear existing seed data (only seeded users/jobs)
    const seedEmails = [...seedClients, ...seedProviders].map(u => u.email);
    await User.deleteMany({ email: { $in: seedEmails } });
    await Job.deleteMany({ title: { $in: seedJobsTemplate.map(j => j.title) } });
    console.log('✓ Cleared previous seed data');

    // Create users (password hashing handled by pre-save hook)
    const createdClients = [];
    for (const clientData of seedClients) {
      const user = new User(clientData);
      await user.save();
      createdClients.push(user);
    }
    console.log(`✓ Created ${createdClients.length} client accounts`);

    const createdProviders = [];
    for (const providerData of seedProviders) {
      const user = new User(providerData);
      await user.save();
      createdProviders.push(user);
    }
    console.log(`✓ Created ${createdProviders.length} provider accounts`);

    // Distribute jobs across clients
    const createdJobs = [];
    for (let i = 0; i < seedJobsTemplate.length; i++) {
      const client = createdClients[i % createdClients.length];
      const job = new Job({
        ...seedJobsTemplate[i],
        client: client._id
      });
      await job.save();
      createdJobs.push(job);
    }
    console.log(`✓ Created ${createdJobs.length} premium job listings`);

    // Add some bids from providers on open jobs
    const bidPairs = [
      { jobIdx: 0, providerIdx: 0, amount: 16500, proposal: 'I have extensive experience designing enterprise API platforms at Stripe scale. My approach includes a microservices-first architecture with event-driven communication patterns. I can deliver the full architecture document, OpenAPI specs, and IaC templates within 6 weeks.' },
      { jobIdx: 0, providerIdx: 2, amount: 17200, proposal: 'With my background in quantitative systems at hedge funds, I understand the performance and compliance requirements intimately. I would architect this using an API gateway pattern with Kong, backed by event sourcing for audit compliance.' },
      { jobIdx: 1, providerIdx: 1, amount: 23000, proposal: 'Luxury brand identity is my specialty. At Pentagram, I led redesigns for three luxury hospitality brands. My process involves immersive stakeholder workshops, iterative concept development, and meticulous attention to material and tactile design elements.' },
      { jobIdx: 2, providerIdx: 2, amount: 32000, proposal: 'I built similar commodity prediction systems at Two Sigma. My approach combines satellite data from Planet Labs with shipping AIS data and NOAA weather feeds. I use a custom ensemble of temporal fusion transformers and gradient boosting for multi-horizon forecasting.' },
      { jobIdx: 4, providerIdx: 0, amount: 20000, proposal: 'I have built investor-grade dashboards for three VC firms. My stack of choice is React with D3.js for custom visualizations, connected to a real-time data pipeline. I prioritize clean, elegant data presentation that tells a story.' },
      { jobIdx: 4, providerIdx: 1, amount: 21500, proposal: 'My design background combined with frontend engineering skills makes me ideal for this. I would create a design system first, then build with Next.js and Recharts, ensuring the dashboard feels as premium as the fund it represents.' },
      { jobIdx: 5, providerIdx: 1, amount: 13500, proposal: 'I have designed pitch decks that helped startups raise over $200M collectively. I combine narrative design with clean data visualization to create decks that investors remember. The financial model will be built for stress-testing.' },
      { jobIdx: 6, providerIdx: 2, amount: 26000, proposal: 'NLP-driven intelligence platforms are my core competency. I would use fine-tuned BERT models for classification and topic modeling, with a RAG pipeline for insight generation. Integration with Zendesk and Salesforce via their webhooks API.' },
    ];

    let bidCount = 0;
    for (const bp of bidPairs) {
      const bid = new Bid({
        job: createdJobs[bp.jobIdx]._id,
        provider: createdProviders[bp.providerIdx]._id,
        amount: bp.amount,
        proposal: bp.proposal,
        status: 'Pending'
      });
      await bid.save();
      bidCount++;
    }
    console.log(`✓ Created ${bidCount} provider proposals`);

    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('  VANTAGE SEED COMPLETE');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('\n  Demo Accounts (password: VantageDemo2026):');
    console.log('  ─────────────────────────────────────');
    createdClients.forEach(c => console.log(`  CLIENT   │ ${c.email}`));
    createdProviders.forEach(p => console.log(`  PROVIDER │ ${p.email}`));
    console.log('\n');

    process.exit(0);
  } catch (err) {
    console.error('Seed failed:', err);
    process.exit(1);
  }
}

seed();
