import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';

const JobDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();

    const [job, setJob] = useState(null);
    const [bids, setBids] = useState([]);
    const [bidAmount, setBidAmount] = useState('');
    const [proposal, setProposal] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [successMsg, setSuccessMsg] = useState('');

    useEffect(() => {
        fetchJobDetails();
    }, [id]);

    const fetchJobDetails = async () => {
        try {
            const res = await api.get(`/jobs/${id}`);
            setJob(res.data);

            // If Client and owner, fetch bids
            if (user?.role === 'Client' && res.data.client?._id === user?.id) {
                fetchBids();
            }
        } catch (err) {
            setError('Failed to load engagement details.');
            setLoading(false);
        } finally {
            if (user?.role !== 'Client') setLoading(false);
        }
    };

    const fetchBids = async () => {
        try {
            const res = await api.get(`/jobs/${id}/bids`);
            setBids(res.data);
        } catch (err) {
            console.error("Failed to fetch bids", err);
        } finally {
            setLoading(false);
        }
    };

    const handleBidSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccessMsg('');

        try {
            await api.post(`/jobs/${id}/bids`, {
                amount: bidAmount,
                proposal
            });
            setSuccessMsg('Proposal submitted successfully.');
            setBidAmount('');
            setProposal('');
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to submit proposal.');
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-primary-bg flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent-gold"></div>
            </div>
        );
    }

    if (!job) {
        return (
            <div className="min-h-screen bg-primary-bg text-text-main p-8 text-center">
                Engagement not found.
                <button onClick={() => navigate('/dashboard')} className="block mx-auto mt-4 text-accent-gold underline">Return to Dashboard</button>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-primary-bg text-text-main p-6 flex flex-col items-center">
            <div className="w-full max-w-4xl">
                <button
                    onClick={() => navigate(-1)}
                    className="text-text-muted hover:text-accent-gold text-xs uppercase tracking-wider mb-6 flex items-center gap-2 transition-colors"
                >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
                    Back
                </button>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Main Job Content */}
                    <div className="lg:col-span-2 space-y-6">
                        <div className="bg-secondary-bg border border-border rounded-xl p-8 shadow-xl">
                            <div className="flex justify-between items-start mb-6">
                                <div>
                                    <span className="px-3 py-1 rounded-md bg-primary-bg border border-border text-[10px] uppercase tracking-wider text-accent-gold mb-3 inline-block">
                                        {job.category}
                                    </span>
                                    <h1 className="font-serif text-3xl text-text-main mb-2">{job.title}</h1>
                                    <div className="text-sm text-text-muted flex items-center gap-4">
                                        <span>Posted by {job.client?.company || job.client?.name}</span>
                                        <span>•</span>
                                        <span>{new Date(job.createdAt).toLocaleDateString()}</span>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className="text-2xl font-mono text-text-main">${job.budget?.toLocaleString()}</div>
                                    <div className="text-[10px] text-text-muted uppercase tracking-wider">Budget</div>
                                </div>
                            </div>

                            <div className="prose prose-invert max-w-none text-text-muted text-sm leading-relaxed border-t border-border pt-6">
                                <h3 className="text-text-main font-bold uppercase text-xs tracking-widest mb-3">Parameters</h3>
                                <p className="whitespace-pre-wrap">{job.description}</p>
                            </div>

                            <div className="mt-8 pt-6 border-t border-border flex items-center gap-2 text-xs text-text-muted">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
                                {job.location}
                            </div>
                        </div>

                        {/* Bids List (Client Only) */}
                        {user?.role === 'Client' && job.client?._id === user?.id && (
                            <div className="bg-secondary-bg border border-border rounded-xl p-8 shadow-xl">
                                <h3 className="font-serif text-xl text-text-main mb-6">Received Proposals ({bids.length})</h3>

                                {bids.length === 0 ? (
                                    <p className="text-text-muted text-sm italic">No proposals received yet.</p>
                                ) : (
                                    <div className="space-y-4">
                                        {bids.map((bid) => (
                                            <div key={bid._id} className="bg-primary-bg/30 border border-border p-4 rounded-lg">
                                                <div className="flex justify-between items-start mb-2">
                                                    <div>
                                                        <div className="font-semibold text-text-main">{bid.provider?.name}</div>
                                                        <div className="text-[10px] text-text-muted">{new Date(bid.createdAt).toLocaleDateString()}</div>
                                                    </div>
                                                    <div className="font-mono text-accent-gold">${bid.amount?.toLocaleString()}</div>
                                                </div>
                                                <p className="text-sm text-text-muted mt-2">{bid.proposal}</p>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Sidebar / Action Area */}
                    <div className="lg:col-span-1">
                        {user?.role === 'Provider' && (
                            <div className="bg-secondary-bg border border-border rounded-xl p-6 shadow-xl sticky top-24">
                                <h3 className="font-serif text-lg text-text-main mb-4">Submit Proposal</h3>
                                {error && (
                                    <div className="bg-red-500/10 text-red-400 px-3 py-2 mb-4 text-xs border border-red-500/20 rounded">
                                        {error}
                                    </div>
                                )}
                                {successMsg && (
                                    <div className="bg-green-500/10 text-green-400 px-3 py-2 mb-4 text-xs border border-green-500/20 rounded">
                                        {successMsg}
                                    </div>
                                )}

                                <form onSubmit={handleBidSubmit} className="space-y-4">
                                    <div>
                                        <label className="text-[10px] uppercase tracking-wider text-text-muted font-medium mb-1 block">Proposed Amount ($)</label>
                                        <input
                                            type="number"
                                            value={bidAmount}
                                            onChange={(e) => setBidAmount(e.target.value)}
                                            className="w-full bg-primary-bg/50 border border-border rounded px-3 py-2 text-text-main text-sm focus:border-accent-gold focus:outline-none"
                                            placeholder="0.00"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="text-[10px] uppercase tracking-wider text-text-muted font-medium mb-1 block">Cover Letter</label>
                                        <textarea
                                            value={proposal}
                                            onChange={(e) => setProposal(e.target.value)}
                                            rows="4"
                                            className="w-full bg-primary-bg/50 border border-border rounded px-3 py-2 text-text-main text-sm focus:border-accent-gold focus:outline-none"
                                            placeholder="Describe your approach..."
                                            required
                                        />
                                    </div>
                                    <button
                                        type="submit"
                                        className="w-full bg-gradient-to-r from-accent-gold to-yellow-600 text-primary-bg py-3 font-bold uppercase tracking-widest text-xs rounded-lg hover:shadow-lg hover:shadow-accent-gold/20 transition-all duration-300"
                                    >
                                        Submit Bid
                                    </button>
                                </form>
                            </div>
                        )}

                        {user?.role === 'Client' && job.client?._id !== user?.id && (
                            <div className="bg-secondary-bg border border-border rounded-xl p-6 shadow-xl sticky top-24">
                                <p className="text-text-muted text-sm">You are viewing this as a Client.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default JobDetails;
