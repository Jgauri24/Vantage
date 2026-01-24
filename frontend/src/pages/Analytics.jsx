import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';

const Analytics = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchStats = async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await api.get('/users/analytics');
            setStats(res.data);
        } catch (err) {
            console.error("Failed to fetch analytics", err);
            setError('Unable to load analytics right now. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchStats();
    }, []);

    const completed = stats?.totalCompleted || 0;
    const active = stats?.activeCount || 0;
    const monetary = stats?.monetaryValue || 0;
    const total = completed + active;
    const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;
    const averageValue = completed > 0 ? monetary / completed : 0;
    const hasActivity = total > 0 || monetary > 0;

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
                    <button
                        onClick={() => navigate('/dashboard')}
                        className="flex items-center gap-2 text-text-muted hover:text-accent-gold transition-colors text-xs uppercase tracking-widest font-bold"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
                        </svg>
                        Dashboard
                    </button>
                    <div className="font-serif text-lg text-accent-gold">Professional Analytics</div>
                    <div className="w-20"></div>
                </div>
            </header>

            <main className="max-w-4xl mx-auto px-6 py-12">
                {error && (
                    <div className="mb-6 rounded-xl border border-red-500/40 bg-red-500/5 text-red-200 px-4 py-3 flex items-center justify-between gap-4">
                        <div className="text-sm">{error}</div>
                        <button
                            onClick={fetchStats}
                            className="text-xs px-3 py-1 rounded-lg border border-red-400/60 hover:bg-red-500/10 transition-colors"
                        >
                            Retry
                        </button>
                    </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                    <div className="bg-secondary-bg border border-border p-6 rounded-2xl shadow-xl">
                        <div className="text-[10px] uppercase tracking-widest text-text-muted mb-2 font-bold">Wallet Balance</div>
                        <div className="text-3xl font-serif text-accent-gold">
                            $
                            {user?.walletBalance?.toLocaleString(undefined, {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2,
                            }) || '0.00'}
                        </div>
                    </div>
                    <div className="bg-secondary-bg border border-border p-6 rounded-2xl shadow-xl">
                        <div className="text-[10px] uppercase tracking-widest text-text-muted mb-2 font-bold">
                            {user?.role === 'Provider' ? 'Total Earnings' : 'Total Spent'}
                        </div>
                        <div className="text-3xl font-serif text-text-main">
                            $
                            {monetary.toLocaleString(undefined, {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2,
                            })}
                        </div>
                    </div>
                    <div className="bg-secondary-bg border border-border p-6 rounded-2xl shadow-xl">
                        <div className="text-[10px] uppercase tracking-widest text-text-muted mb-2 font-bold">Engagements</div>
                        <div className="text-3xl font-serif text-text-main">{completed}</div>
                    </div>
                </div>

                <section className="mb-10">
                    <h2 className="font-serif text-lg mb-4 text-text-main">Activity Overview</h2>
                    {hasActivity ? (
                        <div className="bg-secondary-bg border border-border rounded-2xl p-6 shadow-xl space-y-4">
                            <div className="flex flex-col md:flex-row md:items-end gap-6">
                                <div className="flex-1 space-y-2">
                                    <div className="flex justify-between text-[11px] uppercase tracking-[0.18em] text-text-muted">
                                        <span>Completed</span>
                                        <span>{completed}</span>
                                    </div>
                                    <div className="h-2 rounded-full bg-primary-bg/70 overflow-hidden">
                                        <div
                                            className="h-full bg-emerald-400"
                                            style={{ width: total > 0 ? `${(completed / total) * 100}%` : '0%' }}
                                        />
                                    </div>
                                </div>
                                <div className="flex-1 space-y-2">
                                    <div className="flex justify-between text-[11px] uppercase tracking-[0.18em] text-text-muted">
                                        <span>Active</span>
                                        <span>{active}</span>
                                    </div>
                                    <div className="h-2 rounded-full bg-primary-bg/70 overflow-hidden">
                                        <div
                                            className="h-full bg-sky-400"
                style={{ width: total > 0 ? `${(active / total) * 100}%` : '0%' }}

                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-2">
                                <div className="bg-primary-bg/60 rounded-xl border border-border/60 px-4 py-3">
                                    <div className="text-[9px] uppercase tracking-[0.24em] text-text-muted mb-1">Completion Rate</div>
                                    <div className="text-xl font-mono text-text-main">{completionRate}%</div>
                                </div>
                                <div className="bg-primary-bg/60 rounded-xl border border-border/60 px-4 py-3">
                                    <div className="text-[9px] uppercase tracking-[0.24em] text-text-muted mb-1">
                                        Avg. Value / Engagement
                                    </div>
                                    <div className="text-xl font-mono text-text-main">
                                        ${averageValue.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                                    </div>
                                </div>
                                <div className="bg-primary-bg/60 rounded-xl border border-border/60 px-4 py-3">
                                    <div className="text-[9px] uppercase tracking-[0.24em] text-text-muted mb-1">Total Volume</div>
                                    <div className="text-xl font-mono text-text-main">
                                        ${monetary.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                                    </div>
                                </div>
                                <div className="bg-primary-bg/60 rounded-xl border border-border/60 px-4 py-3">
                                    <div className="text-[9px] uppercase tracking-[0.24em] text-text-muted mb-1">Open Pipeline</div>
                                    <div className="text-xl font-mono text-text-main">{active}</div>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="bg-secondary-bg border border-dashed border-border rounded-2xl p-6 text-sm text-text-muted">
                            Once you start creating or fulfilling contracts, this space will surface your performance trends,
                            completion rate, and financial throughput.
                        </div>
                    )}
                </section>

                <div className="bg-secondary-bg border border-border rounded-2xl p-8 shadow-2xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-8 opacity-5">
                        <svg className="w-32 h-32" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"></path>
                        </svg>
                    </div>

                    <h2 className="font-serif text-2xl mb-6">Performance Narrative</h2>
                    <div className="space-y-6 relative z-10">
                        <p className="text-text-muted leading-relaxed">
                            {hasActivity
                                ? user?.role === 'Provider'
                                    ? `As a ${user.role}, you have successfully fulfilled ${completed} contracts on the Vantage platform. Your specialized skills have generated a total volume of $${monetary.toLocaleString()}.`
                                    : `As a ${user.role}, you have successfully settled ${completed} professional engagements. Your total deployed budget across finalized contracts is $${monetary.toLocaleString()}.`
                                : `Your analytics cockpit is ready. As you begin transacting on Vantage, this space will articulate your commercial velocity, engagement quality, and overall impact.`}
                        </p>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="bg-primary-bg/50 p-4 rounded-xl border border-border/50">
                                <div className="text-[9px] uppercase tracking-widest text-text-muted mb-1">Active Pipeline</div>
                                <div className="text-xl font-mono text-text-main">{active}</div>
                            </div>
                            <div className="bg-primary-bg/50 p-4 rounded-xl border border-border/50">
                                <div className="text-[9px] uppercase tracking-widest text-text-muted mb-1">Completion Rate</div>
                                <div className="text-xl font-mono text-text-main">{completionRate}%</div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default Analytics;
