import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import WalletFundingModal from '../components/WalletFundingModal';
import ChatBox from '../components/ChatBox';


const JobDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user, refreshUser } = useAuth();

    const [job, setJob] = useState(null);
    const [bids, setBids] = useState([]);
    const [myBid, setMyBid] = useState(null);
    const [bidAmount, setBidAmount] = useState('');
    const [proposal, setProposal] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [successMsg, setSuccessMsg] = useState('');
    const [showFundingModal, setShowFundingModal] = useState(false);
    const [requiredFunds, setRequiredFunds] = useState(0);

    useEffect(() => {
        fetchJobDetails();
    }, [id]);

    const fetchJobDetails = async () => {
        try {
            const res = await api.get(`/jobs/${id}`);
            setJob(res.data);

            const currentUserId = user?.id || user?._id;
            const jobClientId = res.data.client?._id || res.data.client?.id;

            console.log("Debug JobDetails:", {
                userRole: user?.role,
                currentUserId,
                jobClientId,
                isOwner: jobClientId === currentUserId
            });

            // If Client and owner, fetch bids
            if (user?.role === 'Client' && jobClientId === currentUserId) {
                await fetchBids();
            } else if (user?.role === 'Provider') {
                // If Provider, fetch my bid to check status
                await fetchMyBid();
            }
        } catch (err) {
            setError('Failed to load engagement details.');
        } finally {
            setLoading(false);
        }
    };

    const fetchBids = async () => {
        try {
            const res = await api.get(`/jobs/${id}/bids`);
            setBids(res.data);
        } catch (err) {
            console.error("Failed to fetch bids", err);
        }
    };

    const fetchMyBid = async () => {
        // Mock implementation for now as seen in previous code
        // actual implementation would fetch from API
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

    const handleAcceptBid = async (bidId) => {
        try {
            await api.patch(`/bids/${bidId}/accept`);
            setSuccessMsg('Proposal accepted. Payment held in escrow.');
            await refreshUser(); // Update wallet balance
            fetchJobDetails();
            fetchBids();
        } catch (err) {
            console.error("Accept bid error:", err);
            if (err.response?.status === 402 && err.response?.data?.required) {
                // Insufficient funds
                setRequiredFunds(err.response.data.required - (err.response.data.current || 0));
                setShowFundingModal(true);
                setError(`Insufficient funds. Please add $${(err.response.data.required - (err.response.data.current || 0)).toFixed(2)} to your wallet.`);
            } else {
                setError(err.response?.data?.error || 'Failed to accept proposal.');
            }
        }
    };

    const [workFile, setWorkFile] = useState(null);

    // ... (existing code)

    const handleSubmitWork = async (e) => {
        e.preventDefault(); // Prevent default if called from form

        if (!workFile) {
            setError('Please select a file to upload.');
            return;
        }

        const formData = new FormData();
        formData.append('workFile', workFile);

        try {
            await api.patch(`/jobs/${id}/submit`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            setSuccessMsg('Work submitted for review.');
            fetchJobDetails();
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to submit work.');
        }
    };

    // ... (existing code)

    const handleApproveWork = async () => {
        try {
            await api.patch(`/jobs/${id}/complete`);
            setSuccessMsg('Work approved. Payment released.');
            await refreshUser();
            fetchJobDetails();
        } catch (err) {
            setError('Failed to approve work.');
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
                                    <span className="px-3 py-1 rounded-md bg-primary-bg border border-border text-[10px] uppercase tracking-wider text-accent-gold mb-3 inline-block mr-2">
                                        {job.category}
                                    </span>
                                    {job.status === 'Reviewing' && <span className="px-3 py-1 rounded-md bg-blue-500/20 text-blue-400 border border-blue-500/50 text-[10px] uppercase tracking-wider mb-3 inline-block">Reviewing</span>}
                                    {job.status === 'Completed' && <span className="px-3 py-1 rounded-md bg-green-500/20 text-green-400 border border-green-500/50 text-[10px] uppercase tracking-wider mb-3 inline-block">Completed</span>}
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
                        {user?.role === 'Client' && (job.client?._id === user?.id || job.client?._id === user?._id) && (
                            <div className="bg-secondary-bg border border-border rounded-xl p-8 shadow-xl">
                                <h3 className="font-serif text-xl text-text-main mb-6">Received Proposals ({bids.length})</h3>

                                {bids.length === 0 ? (
                                    <p className="text-text-muted text-sm italic">No proposals received yet.</p>
                                ) : (
                                    <div className="space-y-4">
                                        {bids.map((bid) => (
                                            <div key={bid._id} className={`bg-primary-bg/30 border border-border p-4 rounded-lg relative ${bid.status === 'Accepted' ? 'border-accent-gold/50 bg-accent-gold/5' : ''}`}>
                                                <div className="flex justify-between items-start mb-2">
                                                    <div>
                                                        <div className="font-semibold text-text-main flex items-center gap-2">
                                                            {bid.provider?.name}
                                                            {bid.status === 'Accepted' && (
                                                                <span className="text-[10px] bg-accent-gold text-primary-bg px-2 py-0.5 rounded font-bold uppercase tracking-wider">Accepted</span>
                                                            )}
                                                        </div>
                                                        <div className="text-[10px] text-text-muted">{new Date(bid.createdAt).toLocaleDateString()}</div>
                                                    </div>
                                                    <div className="text-right">
                                                        <div className="font-mono text-accent-gold">${bid.amount?.toLocaleString()}</div>
                                                        {job.status === 'Open' && (
                                                            <button
                                                                onClick={() => {
                                                                    if (window.confirm(`Accepting this proposal will deduct $${job.budget} from your wallet. Proceed?`)) {
                                                                        handleAcceptBid(bid._id);
                                                                    }
                                                                }}
                                                                className="mt-2 text-[10px] uppercase tracking-wider font-bold text-primary-bg bg-text-muted hover:bg-accent-gold px-3 py-1 rounded transition-colors"
                                                            >
                                                                Accept & Pay
                                                            </button>
                                                        )}
                                                    </div>
                                                </div>
                                                <p className="text-sm text-text-muted mt-2">{bid.proposal}</p>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Chat Section */}
                        {((user?.role === 'Client' && (job.client?._id === user?.id || job.client?._id === user?._id)) ||
                            (user?.role === 'Provider' && job.status !== 'Open')) && (
                                <div className="mt-8">
                                    <ChatBox jobId={id} jobTitle={job.title} />
                                </div>
                            )}

                    </div>

                    {/* Sidebar / Action Area */}
                    <div className="lg:col-span-1">
                        {/* Wallet Balance Widget for Client */}
                        {user?.role === 'Client' && (job.client?._id === user?.id || job.client?._id === user?._id) && (

                            <div className="bg-secondary-bg border border-border rounded-xl p-6 shadow-xl mb-6">
                                <div className="text-[10px] uppercase tracking-widest text-text-muted mb-2 font-bold">Your Wallet Balance</div>
                                <div className="text-2xl font-serif text-accent-gold mb-4">${user.walletBalance?.toFixed(2) || '0.00'}</div>
                                <button
                                    onClick={() => setShowFundingModal(true)}
                                    className="w-full bg-primary-bg border border-border text-text-muted hover:text-text-main hover:border-accent-gold py-2 rounded text-xs uppercase tracking-wider font-bold transition-colors"
                                >
                                    Add Funds
                                </button>
                            </div>
                        )}
                        {user?.role === 'Provider' && job.status === 'Open' && (
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

                        {user?.role === 'Provider' && job.status === 'Contracted' && (
                            <div className="bg-secondary-bg border border-border rounded-xl p-6 shadow-xl sticky top-24 text-center">
                                <h3 className="font-serif text-lg text-text-main mb-2">Active Contract</h3>
                                <p className="text-text-muted text-sm mb-4">You are contracted for this engagement.</p>

                                <div className="mb-4 text-left">
                                    <label className="text-[10px] uppercase tracking-wider text-text-muted font-medium mb-1 block">Upload Work (PDF/Image)</label>
                                    <input
                                        type="file"
                                        accept=".pdf,image/*"
                                        onChange={(e) => setWorkFile(e.target.files[0])}
                                        className="w-full text-xs text-text-muted file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-accent-gold/10 file:text-accent-gold hover:file:bg-accent-gold/20 cursor-pointer"
                                    />
                                </div>

                                <button
                                    onClick={handleSubmitWork}
                                    className="w-full bg-gradient-to-r from-accent-gold to-yellow-600 text-primary-bg py-3 font-bold uppercase tracking-widest text-xs rounded-lg hover:shadow-lg hover:shadow-accent-gold/20 transition-all duration-300"
                                >
                                    Submit Work for Review
                                </button>
                            </div>
                        )}

                        {user?.role === 'Provider' && job.status === 'Reviewing' && (
                            <div className="bg-secondary-bg border border-border rounded-xl p-6 shadow-xl sticky top-24 text-center">
                                <h3 className="font-serif text-lg text-text-main mb-2">Under Review</h3>
                                <p className="text-text-muted text-sm">Client is reviewing your submission.</p>
                            </div>
                        )}

                        {user?.role === 'Client' && job.status === 'Reviewing' && (
                            <div className="bg-secondary-bg border border-border rounded-xl p-6 shadow-xl sticky top-24 text-center">
                                <h3 className="font-serif text-lg text-text-main mb-2">Work Submitted</h3>
                                <p className="text-text-muted text-sm mb-4">Provider has submitted work for approval.</p>

                                {job.workSubmission && (
                                    <div className="mb-4 bg-primary-bg/30 p-3 rounded-lg border border-border text-left">
                                        <div className="text-[10px] uppercase text-text-muted mb-1">Submitted File</div>
                                        <a
                                            href={job.workSubmission.fileUrl}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-accent-gold hover:underline text-sm font-medium flex items-center gap-2"
                                        >
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
                                            {job.workSubmission.fileName || 'View Submission'}
                                        </a>
                                        <div className="text-[10px] text-text-muted mt-1 text-right">
                                            {new Date(job.workSubmission.submittedAt).toLocaleDateString()}
                                        </div>
                                    </div>
                                )}
                                <button
                                    onClick={handleApproveWork}
                                    className="w-full bg-green-600 hover:bg-green-500 text-white py-3 font-bold uppercase tracking-widest text-xs rounded-lg hover:shadow-lg hover:shadow-green-500/20 transition-all duration-300"
                                >
                                    Approve & Pay
                                </button>
                            </div>
                        )}

                        {job.status === 'Completed' && (
                            <div className="bg-secondary-bg border border-border rounded-xl p-6 shadow-xl sticky top-24 text-center">
                                <h3 className="font-serif text-lg text-text-main mb-2 text-green-400">Completed</h3>
                                <p className="text-text-muted text-sm">This engagement is closed.</p>
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

            <WalletFundingModal
                isOpen={showFundingModal}
                onClose={() => setShowFundingModal(false)}
                onSuccess={(newBalance) => {
                    refreshUser();
                    setSuccessMsg('Funds added successfully. You can now accept the proposal.');
                    setError('');
                }}
                initialAmount={requiredFunds > 0 ? requiredFunds : 100}
            />
        </div>
    );
};

export default JobDetails;
