import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';
import WalletFundingModal from '../components/WalletFundingModal';
import TransactionHistory from '../components/TransactionHistory';

const Profile = () => {
    const { user } = useAuth(); 
    const navigate = useNavigate();

    const [isEditing, setIsEditing] = useState(false);
    const [loading, setLoading] = useState(true);
    const [showFundingModal, setShowFundingModal] = useState(false);
    const [walletBalance, setWalletBalance] = useState(0);
    const [analytics, setAnalytics] = useState(null);
    const [profileData, setProfileData] = useState({
        name: '',
        email: '',
        company: '',
        bio: '',
        headline: '',
        experience: '',
        skills: '', 
        hourlyRate: '',
        yearsOfExperience: '',
        location: '',
        portfolioLinks: '' 
    });

    useEffect(() => {
        fetchProfile();
        fetchWalletBalance();
        fetchAnalytics();
    }, []);

    const fetchProfile = async () => {
        try {
            const res = await api.get('/users/me');
            setProfileData({
                name: res.data.name || '',
                email: res.data.email || '',
                company: res.data.company || '',
                bio: res.data.bio || '',
                headline: res.data.headline || '',
                experience: res.data.experience || '',
                skills: res.data.skills ? res.data.skills.join(', ') : '',
                hourlyRate: res.data.hourlyRate || '',
                yearsOfExperience: res.data.yearsOfExperience || '',
                location: res.data.location || '',
                portfolioLinks: res.data.portfolioLinks ? res.data.portfolioLinks.join('\n') : ''
            });
            setWalletBalance(res.data.walletBalance || 0);
        } catch (err) {
            console.error("Failed to fetch profile", err);
        } finally {
            setLoading(false);
        }
    };

    const fetchAnalytics = async () => {
        try {
            const res = await api.get('/users/analytics');
            setAnalytics(res.data);
        } catch (err) {
            console.error("Failed to fetch analytics for profile", err);
        }
    };

    const fetchWalletBalance = async () => {
        try {
            const res = await api.get('/payments/wallet-balance');
            setWalletBalance(res.data.walletBalance);
        } catch (err) {
            console.error("Failed to fetch wallet balance", err);
        }
    };

    const handleFundingSuccess = (newBalance) => {
        setWalletBalance(newBalance);
        // Optionally show success message
    };

    const handleSave = async (e) => {
        e.preventDefault();
        try {
            const updates = {
                name: profileData.name,
                company: profileData.company,
                bio: profileData.bio,
                headline: profileData.headline,
                experience: profileData.experience,
                location: profileData.location,
                skills: profileData.skills.split(',').map(s => s.trim()).filter(s => s),
                hourlyRate: profileData.hourlyRate,
                yearsOfExperience: profileData.yearsOfExperience || null,
                portfolioLinks: profileData.portfolioLinks
                    .split(/\n|,/)
                    .map(s => s.trim())
                    .filter(s => s)
            };

            await api.patch('/users/profile', updates);
            // Optionally update global auth context here if we had a method for it
            setIsEditing(false);
            fetchProfile(); // Re-fetch to normalize data
        } catch (err) {
            console.error("Failed to update profile", err);
        }
    };

    const completed = analytics?.totalCompleted || 0;
    const active = analytics?.activeCount || 0;
    const monetary = analytics?.monetaryValue || 0;
    const totalEngagements = completed + active;
    const completionRate = totalEngagements > 0 ? Math.round((completed / totalEngagements) * 100) : 0;

    if (loading) {
        return (
            <div className="min-h-screen bg-primary-bg flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent-gold"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-primary-bg text-text-main">
            <header className="bg-secondary-bg/80 backdrop-blur-md border-b border-border sticky top-0 z-20">
                <div className="max-w-7xl mx-auto px-6 h-16 flex justify-between items-center">
                    <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate('/dashboard')}>
                        <div className="w-8 h-8 rounded bg-gradient-to-br from-accent-gold to-yellow-700 flex items-center justify-center text-primary-bg font-serif font-bold text-xl">V</div>
                        <span className="font-serif text-lg tracking-tight text-text-main">Vantage</span>
                    </div>
                    <button onClick={() => navigate('/dashboard')} className="text-text-muted hover:text-accent-gold text-xs uppercase tracking-wider transition-colors">Return to Dashboard</button>
                </div>
            </header>

            <main className="max-w-4xl mx-auto px-6 py-12">
                <div className="flex justify-between items-end mb-8">
                    <div>
                        <h1 className="font-serif text-4xl text-text-main mb-2">My Profile</h1>
                        <p className="text-text-muted">Manage your professional identity.</p>
                    </div>
                    {!isEditing && (
                        <button
                            onClick={() => setIsEditing(true)}
                            className="bg-accent-gold text-primary-bg px-6 py-2 rounded-lg font-bold text-xs uppercase tracking-wider hover:bg-yellow-500 transition-colors"
                        >
                            Edit Profile
                        </button>
                    )}
                </div>

                <div className="bg-secondary-bg border border-border rounded-xl p-8 shadow-xl">
                    {isEditing ? (
                        <form onSubmit={handleSave} className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="text-[10px] uppercase tracking-wider text-text-muted font-bold block mb-2">Full Name</label>
                                    <input
                                        type="text"
                                        value={profileData.name}
                                        onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                                        className="w-full bg-primary-bg border border-border rounded px-4 py-3 text-text-main focus:border-accent-gold focus:outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="text-[10px] uppercase tracking-wider text-text-muted font-bold block mb-2">Email</label>
                                    <input
                                        type="email"
                                        value={profileData.email}
                                        disabled
                                        className="w-full bg-primary-bg/50 border border-border rounded px-4 py-3 text-text-muted cursor-not-allowed"
                                    />
                                </div>
                                <div>
                                    <label className="text-[10px] uppercase tracking-wider text-text-muted font-bold block mb-2">Location</label>
                                    <input
                                        type="text"
                                        value={profileData.location}
                                        onChange={(e) => setProfileData({ ...profileData, location: e.target.value })}
                                        className="w-full bg-primary-bg border border-border rounded px-4 py-3 text-text-main focus:border-accent-gold focus:outline-none"
                                        placeholder="e.g. New York, NY"
                                    />
                                </div>
                                <div>
                                    <label className="text-[10px] uppercase tracking-wider text-text-muted font-bold block mb-2">Company / Organization</label>
                                    <input
                                        type="text"
                                        value={profileData.company}
                                        onChange={(e) => setProfileData({ ...profileData, company: e.target.value })}
                                        className="w-full bg-primary-bg border border-border rounded px-4 py-3 text-text-main focus:border-accent-gold focus:outline-none"
                                    />
                                </div>
                                {user?.role === 'Provider' && (
                                    <div>
                                        <label className="text-[10px] uppercase tracking-wider text-text-muted font-bold block mb-2">Professional Headline</label>
                                        <input
                                            type="text"
                                            value={profileData.headline}
                                            onChange={(e) => setProfileData({ ...profileData, headline: e.target.value })}
                                            className="w-full bg-primary-bg border border-border rounded px-4 py-3 text-text-main focus:border-accent-gold focus:outline-none"
                                            placeholder="e.g. Senior Corporate Lawyer • 8+ yrs"
                                        />
                                    </div>
                                )}
                            </div>

                            <div>
                                <label className="text-[10px] uppercase tracking-wider text-text-muted font-bold block mb-2">Professional Bio</label>
                                <textarea
                                    rows="4"
                                    value={profileData.bio}
                                    onChange={(e) => setProfileData({ ...profileData, bio: e.target.value })}
                                    className="w-full bg-primary-bg border border-border rounded px-4 py-3 text-text-main focus:border-accent-gold focus:outline-none"
                                    placeholder="Tell us about your expertise..."
                                />
                            </div>

                            {user?.role === 'Provider' && (
                                <>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div>
                                            <label className="text-[10px] uppercase tracking-wider text-text-muted font-bold block mb-2">Skills (Comma separated)</label>
                                            <input
                                                type="text"
                                                value={profileData.skills}
                                                onChange={(e) => setProfileData({ ...profileData, skills: e.target.value })}
                                                className="w-full bg-primary-bg border border-border rounded px-4 py-3 text-text-main focus:border-accent-gold focus:outline-none"
                                                placeholder="e.g. Contract Drafting, IP Strategy, M&A Diligence"
                                            />
                                        </div>
                                        <div>
                                            <label className="text-[10px] uppercase tracking-wider text-text-muted font-bold block mb-2">Hourly Rate ($)</label>
                                            <input
                                                type="number"
                                                value={profileData.hourlyRate}
                                                onChange={(e) => setProfileData({ ...profileData, hourlyRate: e.target.value })}
                                                className="w-full bg-primary-bg border border-border rounded px-4 py-3 text-text-main focus:border-accent-gold focus:outline-none"
                                            />
                                        </div>
                                        <div>
                                            <label className="text-[10px] uppercase tracking-wider text-text-muted font-bold block mb-2">Years of Experience</label>
                                            <input
                                                type="number"
                                                value={profileData.yearsOfExperience}
                                                onChange={(e) => setProfileData({ ...profileData, yearsOfExperience: e.target.value })}
                                                className="w-full bg-primary-bg border border-border rounded px-4 py-3 text-text-main focus:border-accent-gold focus:outline-none"
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="text-[10px] uppercase tracking-wider text-text-muted font-bold block mb-2">Experience Summary</label>
                                        <textarea
                                            rows="3"
                                            value={profileData.experience}
                                            onChange={(e) => setProfileData({ ...profileData, experience: e.target.value })}
                                            className="w-full bg-primary-bg border border-border rounded px-4 py-3 text-text-main focus:border-accent-gold focus:outline-none"
                                            placeholder="Highlight key roles, industries and notable matters..."
                                        />
                                    </div>

                                    <div>
                                        <label className="text-[10px] uppercase tracking-wider text-text-muted font-bold block mb-2">Portfolio Links</label>
                                        <textarea
                                            rows="3"
                                            value={profileData.portfolioLinks}
                                            onChange={(e) => setProfileData({ ...profileData, portfolioLinks: e.target.value })}
                                            className="w-full bg-primary-bg border border-border rounded px-4 py-3 text-text-main focus:border-accent-gold focus:outline-none"
                                            placeholder="One URL per line (e.g. case study, website, GitHub, Notion, PDF, etc.)"
                                        />
                                    </div>
                                </>
                            )}

                            <div className="flex gap-4 pt-4">
                                <button
                                    type="button"
                                    onClick={() => setIsEditing(false)}
                                    className="px-6 py-2 rounded-lg border border-border text-text-muted hover:text-text-main text-xs uppercase tracking-wider font-bold transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-6 py-2 rounded-lg bg-accent-gold text-primary-bg text-xs uppercase tracking-wider font-bold hover:bg-yellow-500 transition-colors"
                                >
                                    Save Changes
                                </button>
                            </div>
                        </form>
                    ) : (
                        <div className="space-y-8">
                            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
                                <div className="flex items-start gap-6">
                                    <div className="w-24 h-24 rounded-full bg-primary-bg border-2 border-accent-gold flex items-center justify-center text-3xl font-serif text-text-main">
                                        {profileData.name.charAt(0)}
                                    </div>
                                    <div>
                                        <h2 className="text-2xl font-serif text-text-main">{profileData.name}</h2>
                                        <div className="inline-flex items-center gap-2 mb-2">
                                            <span className="px-2 py-0.5 rounded-full bg-accent-gold/10 border border-accent-gold/40 text-[10px] font-semibold uppercase tracking-widest text-accent-gold">
                                                {user?.role}
                                            </span>
                                            {user?.role === 'Provider' && profileData.hourlyRate && (
                                                <span className="text-xs text-text-muted">
                                                    ${profileData.hourlyRate}/hr
                                                </span>
                                            )}
                                        </div>
                                        <div className="text-text-muted text-sm flex flex-wrap items-center gap-4">
                                            {profileData.location && (
                                                <span className="flex items-center gap-1">
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path>
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path>
                                                    </svg>
                                                    {profileData.location}
                                                </span>
                                            )}
                                            {profileData.company && (
                                                <span className="flex items-center gap-1">
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path>
                                                    </svg>
                                                    {profileData.company}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-3 w-full md:w-auto md:min-w-[260px]">
                                    <div className="bg-primary-bg/60 border border-border/60 rounded-xl px-4 py-3">
                                        <div className="text-[9px] uppercase tracking-[0.24em] text-text-muted mb-1">
                                            {user?.role === 'Provider' ? 'Jobs Completed' : 'Engagements'}
                                        </div>
                                        <div className="text-xl font-mono text-text-main">
                                            {completed}
                                        </div>
                                    </div>
                                    <div className="bg-primary-bg/60 border border-border/60 rounded-xl px-4 py-3">
                                        <div className="text-[9px] uppercase tracking-[0.24em] text-text-muted mb-1">
                                            {user?.role === 'Provider' ? 'Total Earned' : 'Total Spent'}
                                        </div>
                                        <div className="text-xl font-mono text-text-main">
                                            ${monetary.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                                        </div>
                                    </div>
                                    <div className="bg-primary-bg/60 border border-border/60 rounded-xl px-4 py-3 col-span-2">
                                        <div className="flex items-center justify-between mb-1">
                                            <div className="text-[9px] uppercase tracking-[0.24em] text-text-muted">
                                                Completion Rate
                                            </div>
                                            <div className="text-xs font-mono text-text-main">
                                                {completionRate}%
                                            </div>
                                        </div>
                                        <div className="h-1.5 rounded-full bg-primary-bg overflow-hidden">
                                            <div
                                                className="h-full bg-accent-gold"
                                                style={{ width: `${completionRate}%` }}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="border-t border-border pt-8">
                                <h3 className="text-xs font-bold uppercase tracking-widest text-text-muted mb-4">About</h3>
                                <p className="text-text-main leading-relaxed whitespace-pre-wrap">
                                    {profileData.bio || "No bio provided."}
                                </p>
                            </div>

                            {user?.role === 'Provider' && (
                                <div className="border-t border-border pt-8 grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <div>
                                        <h3 className="text-xs font-bold uppercase tracking-widest text-text-muted mb-4">Skills</h3>
                                        <div className="flex flex-wrap gap-2">
                                            {profileData.skills ? profileData.skills.split(',').map(s => (
                                                <span key={s} className="px-3 py-1 bg-primary-bg border border-border rounded-full text-xs text-text-main">
                                                    {s.trim()}
                                                </span>
                                            )) : <span className="text-text-muted italic text-sm">No skills listed</span>}
                                        </div>
                                    </div>
                                    <div>
                                        <h3 className="text-xs font-bold uppercase tracking-widest text-text-muted mb-4">Rate</h3>
                                        <div className="text-2xl font-mono text-accent-gold">
                                            {profileData.hourlyRate ? `$${profileData.hourlyRate}/hr` : 'Not set'}
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Wallet Section */}
                <div className="bg-secondary-bg border border-border rounded-xl p-8 shadow-xl mt-8">
                    <div className="flex justify-between items-center mb-6">
                        <div>
                            <h2 className="font-serif text-2xl text-text-main mb-1">Wallet</h2>
                            <p className="text-text-muted text-sm">Manage your funds</p>
                        </div>
                        <button
                            onClick={() => setShowFundingModal(true)}
                            className="bg-accent-gold text-primary-bg px-6 py-2 rounded-lg font-bold text-xs uppercase tracking-wider hover:bg-yellow-500 transition-colors"
                        >
                            Add Funds
                        </button>
                    </div>

                    <div className="bg-primary-bg/50 border border-border rounded-xl p-6 mb-6">
                        <div className="text-[10px] uppercase tracking-widest text-text-muted mb-2 font-bold">Current Balance</div>
                        <div className="text-4xl font-serif text-accent-gold">${walletBalance.toFixed(2)}</div>
                    </div>

                    {/* Transaction History */}
                    <div>
                        <h3 className="text-xs font-bold uppercase tracking-widest text-text-muted mb-4">Recent Transactions</h3>
                        <TransactionHistory limit={10} />
                    </div>
                </div>
            </main>

            {/* Wallet Funding Modal */}
            <WalletFundingModal
                isOpen={showFundingModal}
                onClose={() => setShowFundingModal(false)}
                onSuccess={handleFundingSuccess}
            />
        </div>
    );
};

export default Profile;
