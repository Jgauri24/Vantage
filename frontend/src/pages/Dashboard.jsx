import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

import { useState, useEffect } from 'react';
import api from '../utils/api';

const Dashboard = () => {
    const { user, logout, refreshUser } = useAuth();
    const navigate = useNavigate();
    const [activeJobs, setActiveJobs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [fundingAmount, setFundingAmount] = useState('');
    const [isFunding, setIsFunding] = useState(false);
    const [showFundModal, setShowFundModal] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            try {
                await refreshUser();
                const res = await api.get('/jobs');
                setActiveJobs(res.data);
            } catch (err) {
                console.error("Ledger sync failed", err);
            } finally {
                setLoading(false);
            }
        }
        if (user) fetchData();
    }, []);

    const handleFundWallet = async (e) => {
        e.preventDefault();
        if (!fundingAmount || fundingAmount <= 0) return;
        setIsFunding(true);
        try {
            await api.post('/users/fund-wallet', { amount: fundingAmount });
            await refreshUser();
            setShowFundModal(false);
            setFundingAmount('');
        } catch (err) {
            console.error("Funding failed", err);
        } finally {
            setIsFunding(false);
        }
    };

    return (
        <div className="min-h-screen bg-primary-bg text-text-main">
            {/* Top Navigation */}
            <header className="bg-secondary-bg/80 backdrop-blur-md border-b border-border sticky top-0 z-20">
                <div className="max-w-7xl mx-auto px-6 h-16 flex justify-between items-center">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded bg-gradient-to-br from-accent-gold to-yellow-700 flex items-center justify-center text-primary-bg font-serif font-bold text-xl">V</div>
                        <span className="font-serif text-lg tracking-tight text-text-main">Vantage</span>
                        <span className="px-2 py-0.5 rounded text-[10px] bg-border/30 text-text-muted uppercase tracking-wider border border-border/50">PRO-SERVE</span>
                    </div>

                    <div className="flex items-center gap-6">
                        <div className="text-right hidden sm:block">
                            <p className="font-medium text-xs text-text-main">{user?.name}</p>
                            <p className="text-[10px] font-mono uppercase tracking-wider text-accent-gold">{user?.role}</p>
                        </div>
                        <button
                            onClick={logout}
                            className="text-text-muted hover:text-white text-xs uppercase tracking-wider transition-colors"
                        >
                            Logout
                        </button>
                    </div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-6 py-8">

                {/* Hero Welcome */}
                <div className="mb-10 relative">
                    <h1 className="font-serif text-3xl md:text-4xl lg:text-5xl text-text-main mb-2">
                        Welcome, <span className="text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-400">{user?.name}</span>
                    </h1>
                    <p className="text-text-muted max-w-xl">
                        Your command center for {user?.role === 'Client' ? 'managing service acquisitions' : 'professional service delivery'}.
                        Access your ledger and active engagements below.
                    </p>
                    <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-accent-gold/5 rounded-full blur-3xl -z-10 -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-12 gap-6">

                    {/* Stats / Quick Info */}
                    <div className="md:col-span-4 lg:col-span-3 space-y-6">
                        <div className="bg-secondary-bg border border-border rounded-xl p-5 shadow-lg">
                            <h3 className="text-xs font-bold uppercase tracking-widest text-text-muted mb-4">Identity</h3>
                            <div className="space-y-4">
                                <div>
                                    <label className="text-[10px] uppercase text-text-muted block mb-1">Account ID</label>
                                    <div className="font-mono text-xs text-accent-gold bg-primary-bg/50 p-2 rounded border border-border/50 truncate">
                                        {user?.id}
                                    </div>
                                </div>
                                <div>
                                    <label className="text-[10px] uppercase text-text-muted block mb-1">Email</label>
                                    <div className="text-sm text-text-main">{user?.email}</div>
                                </div>
                                {user?.company && (
                                    <div>
                                        <label className="text-[10px] uppercase text-text-muted block mb-1">Company</label>
                                        <div className="text-sm text-text-main">{user.company}</div>
                                    </div>
                                )}
                            </div>
                            <button
                                onClick={() => navigate('/profile')}
                                className="w-full mt-4 text-[10px] uppercase tracking-wider font-bold text-accent-gold border border-accent-gold/30 hover:bg-accent-gold hover:text-primary-bg py-2 rounded transition-all duration-300"
                            >
                                Manage Identity
                            </button>
                        </div>

                        <div className="bg-gradient-to-br from-accent-gold to-yellow-700 rounded-xl p-5 text-primary-bg shadow-lg">
                            <div className="flex justify-between items-start mb-8">
                                <h3 className="text-xs font-bold uppercase tracking-widest opacity-80">Credit Balance</h3>
                                <svg className="w-5 h-5 opacity-80" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                            </div>
                            <div className="text-3xl font-serif font-bold mb-1">${user?.walletBalance?.toLocaleString() || '0.00'}</div>
                            <div className="text-xs opacity-70 mb-4">Available for allocation</div>

                            <button
                                onClick={() => setShowFundModal(true)}
                                className="w-full bg-primary-bg/20 hover:bg-primary-bg/40 text-primary-bg font-bold text-[10px] uppercase tracking-wider py-2 rounded border border-primary-bg/30 transition-all"
                            >
                                Add Funds
                            </button>
                        </div>
                    </div>

                    {/* Funding Modal */}
                    {showFundModal && (
                        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                            <div className="bg-secondary-bg border border-border rounded-2xl w-full max-w-md p-8 shadow-2xl">
                                <h2 className="font-serif text-2xl text-text-main mb-2">Fund Your Wallet</h2>
                                <p className="text-text-muted text-sm mb-6">Allocate additional credits to your Vantage account for service engagements.</p>

                                <form onSubmit={handleFundWallet} className="space-y-6">
                                    <div>
                                        <label className="text-[10px] uppercase tracking-widest text-text-muted font-bold block mb-2">Amount to Add (USD)</label>
                                        <div className="relative">
                                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted font-serif">$</span>
                                            <input
                                                type="number"
                                                value={fundingAmount}
                                                onChange={(e) => setFundingAmount(e.target.value)}
                                                placeholder="0.00"
                                                className="w-full bg-primary-bg border border-border rounded-xl pl-8 pr-4 py-4 text-text-main font-serif text-xl focus:border-accent-gold focus:outline-none transition-colors"
                                                autoFocus
                                            />
                                        </div>
                                    </div>

                                    <div className="flex gap-4">
                                        <button
                                            type="button"
                                            onClick={() => setShowFundModal(false)}
                                            className="flex-1 px-6 py-3 rounded-xl border border-border text-text-muted text-xs uppercase tracking-widest font-bold hover:text-text-main transition-colors"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            type="submit"
                                            disabled={isFunding || !fundingAmount}
                                            className="flex-1 px-6 py-3 rounded-xl bg-accent-gold text-primary-bg text-xs uppercase tracking-widest font-bold hover:bg-yellow-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                                        >
                                            {isFunding ? 'Processing...' : 'Confirm Deposit'}
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    )}

                    {/* Ledger / Main Content */}
                    <div className="md:col-span-8 lg:col-span-9 space-y-6">
                        {/* Quick Actions */}
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                            <button
                                onClick={() => navigate('/jobs/create')}
                                className="bg-secondary-bg hover:bg-secondary-bg/80 border border-border hover:border-accent-gold/50 transition-all p-4 rounded-xl text-left group"
                            >
                                <div className="w-8 h-8 rounded-full bg-primary-bg border border-border flex items-center justify-center mb-3 group-hover:border-accent-gold group-hover:text-accent-gold transition-colors">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path></svg>
                                </div>
                                <div className="text-sm font-semibold text-text-main">Post Job</div>
                                <div className="text-[10px] text-text-muted">Create request</div>
                            </button>

                            <button
                                onClick={() => navigate('/marketplace')}
                                className="bg-secondary-bg hover:bg-secondary-bg/80 border border-border hover:border-accent-gold/50 transition-all p-4 rounded-xl text-left group"
                            >
                                <div className="w-8 h-8 rounded-full bg-primary-bg border border-border flex items-center justify-center mb-3 group-hover:border-accent-gold group-hover:text-accent-gold transition-colors">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
                                </div>
                                <div className="text-sm font-semibold text-text-main">Marketplace</div>
                                <div className="text-[10px] text-text-muted">Browse listings</div>
                            </button>

                            <button
                                onClick={() => navigate('/analytics')}
                                className="bg-secondary-bg hover:bg-secondary-bg/80 border border-border hover:border-accent-gold/50 transition-all p-4 rounded-xl text-left group"
                            >
                                <div className="w-8 h-8 rounded-full bg-primary-bg border border-border flex items-center justify-center mb-3 group-hover:border-accent-gold group-hover:text-accent-gold transition-colors">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path></svg>
                                </div>
                                <div className="text-sm font-semibold text-text-main">Analytics</div>
                                <div className="text-[10px] text-text-muted">View reports</div>
                            </button>
                        </div>

                        {/* Ledger Table Placeholder */}
                        <div className="bg-secondary-bg border border-border rounded-xl overflow-hidden shadow-lg">
                            <div className="px-6 py-4 border-b border-border flex justify-between items-center bg-primary-bg/30">
                                <h3 className="font-serif text-lg text-text-main">Active Ledger</h3>
                                <div className="flex gap-2">
                                    <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                                    <span className="text-[10px] uppercase text-text-muted font-bold tracking-wider">Live Sync</span>
                                </div>
                            </div>

                            <div className="min-h-[200px]">
                                {loading ? (
                                    <div className="flex justify-center py-10">
                                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent-gold"></div>
                                    </div>
                                ) : activeJobs.length === 0 ? (
                                    <div className="p-12 text-center text-text-muted">
                                        <div className="w-16 h-16 bg-primary-bg border border-border rounded-full flex items-center justify-center mx-auto mb-4">
                                            <svg className="w-6 h-6 text-border" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"></path></svg>
                                        </div>
                                        <p className="text-sm">No active entries found in the ledger.</p>
                                        <p className="text-xs mt-1 text-text-muted/70">Transactions and contracts will appear here automatically.</p>
                                    </div>
                                ) : (
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-left border-collapse">
                                            <thead className="bg-primary-bg/50 text-[10px] uppercase tracking-wider text-text-muted border-b border-border">
                                                <tr>
                                                    <th className="px-6 py-4 font-medium">Engagement</th>
                                                    <th className="px-6 py-4 font-medium">Category</th>
                                                    <th className="px-6 py-4 font-medium">Status</th>
                                                    <th className="px-6 py-4 font-medium text-right">Value</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-border/50">
                                                {activeJobs.map((job) => (
                                                    <tr
                                                        key={job._id}
                                                        onClick={() => navigate(`/jobs/${job._id}`)}
                                                        className="hover:bg-white/5 transition-colors cursor-pointer"
                                                    >
                                                        <td className="px-6 py-4">
                                                            <div className="font-medium text-text-main text-sm">{job.title}</div>
                                                            <div className="text-[10px] text-text-muted">{new Date(job.createdAt).toLocaleDateString()}</div>
                                                        </td>
                                                        <td className="px-6 py-4">
                                                            <span className="px-2 py-1 rounded-md bg-primary-bg border border-border text-[10px] uppercase tracking-wider text-accent-gold">
                                                                {job.category}
                                                            </span>
                                                        </td>
                                                        <td className="px-6 py-4">
                                                            <span className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-[10px] font-medium border ${job.status === 'Open' ? 'bg-green-500/10 text-green-400 border-green-500/20' :
                                                                job.status === 'Contracted' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' :
                                                                    'bg-gray-500/10 text-gray-400 border-gray-500/20'
                                                                }`}>
                                                                <span className={`w-1.5 h-1.5 rounded-full ${job.status === 'Open' ? 'bg-green-400' :
                                                                    job.status === 'Contracted' ? 'bg-blue-400' :
                                                                        'bg-gray-400'
                                                                    }`}></span>
                                                                {job.status}
                                                            </span>
                                                        </td>
                                                        <td className="px-6 py-4 text-right font-mono text-sm text-text-main">
                                                            ${job.budget?.toLocaleString()}
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default Dashboard;
