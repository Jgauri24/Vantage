import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';

const AdminDashboard = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [overview, setOverview] = useState(null);
    const [users, setUsers] = useState([]);
    const [jobs, setJobs] = useState([]);
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('overview');
    const [userPage, setUserPage] = useState(1);
    const [jobPage, setJobPage] = useState(1);

    useEffect(() => {
        if (user?.role !== 'Admin') {
            navigate('/dashboard');
            return;
        }
        fetchOverview();
    }, [user]);

    const fetchOverview = async () => {
        try {
            const res = await api.get('/admin/overview');
            setOverview(res.data);
            setLoading(false);
        } catch (err) {
            console.error('Failed to fetch admin overview', err);
            setLoading(false);
        }
    };

    const fetchUsers = async (page = 1) => {
        try {
            const res = await api.get(`/admin/users?page=${page}&limit=20`);
            setUsers(res.data);
        } catch (err) {
            console.error('Failed to fetch users', err);
        }
    };

    const fetchJobs = async (page = 1) => {
        try {
            const res = await api.get(`/admin/jobs?page=${page}&limit=20`);
            setJobs(res.data);
        } catch (err) {
            console.error('Failed to fetch jobs', err);
        }
    };

    const fetchTransactions = async () => {
        try {
            const res = await api.get('/admin/transactions?limit=50');
            setTransactions(res.data);
        } catch (err) {
            console.error('Failed to fetch transactions', err);
        }
    };

    useEffect(() => {
        if (activeTab === 'users') {
            fetchUsers(userPage);
        } else if (activeTab === 'jobs') {
            fetchJobs(jobPage);
        } else if (activeTab === 'transactions') {
            fetchTransactions();
        }
    }, [activeTab, userPage, jobPage]);

    const handleDeleteUser = async (userId) => {
        if (!window.confirm('Are you sure you want to delete this user?')) return;
        try {
            await api.delete(`/admin/users/${userId}`);
            fetchUsers(userPage);
            fetchOverview();
        } catch (err) {
            alert(err.response?.data?.error || 'Failed to delete user');
        }
    };

    const handleDeleteJob = async (jobId) => {
        if (!window.confirm('Are you sure you want to delete this job?')) return;
        try {
            await api.delete(`/admin/jobs/${jobId}`);
            fetchJobs(jobPage);
            fetchOverview();
        } catch (err) {
            alert(err.response?.data?.error || 'Failed to delete job');
        }
    };

    const handleUpdateJobStatus = async (jobId, newStatus) => {
        try {
            await api.patch(`/admin/jobs/${jobId}/status`, { status: newStatus });
            fetchJobs(jobPage);
        } catch (err) {
            alert(err.response?.data?.error || 'Failed to update job status');
        }
    };

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
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded bg-gradient-to-br from-accent-gold to-yellow-700 flex items-center justify-center text-primary-bg font-serif font-bold text-xl">V</div>
                        <span className="font-serif text-lg tracking-tight text-text-main">Vantage</span>
                        <span className="px-2 py-0.5 rounded text-[10px] bg-red-500/20 text-red-400 uppercase tracking-wider border border-red-500/50">ADMIN</span>
                    </div>

                    <div className="flex items-center gap-6">
                        <button
                            onClick={() => navigate('/dashboard')}
                            className="text-text-muted hover:text-accent-gold text-xs uppercase tracking-wider transition-colors"
                        >
                            User Dashboard
                        </button>
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
                <h1 className="font-serif text-4xl text-text-main mb-8">Admin Dashboard</h1>

                {/* Tabs */}
                <div className="flex gap-4 mb-8 border-b border-border">
                    {['overview', 'users', 'jobs', 'transactions'].map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`px-6 py-3 text-xs uppercase tracking-wider font-bold transition-colors ${
                                activeTab === tab
                                    ? 'text-accent-gold border-b-2 border-accent-gold'
                                    : 'text-text-muted hover:text-text-main'
                            }`}
                        >
                            {tab.charAt(0).toUpperCase() + tab.slice(1)}
                        </button>
                    ))}
                </div>

                {/* Overview Tab */}
                {activeTab === 'overview' && overview && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        <div className="bg-secondary-bg border border-border rounded-xl p-6">
                            <div className="text-[10px] uppercase tracking-widest text-text-muted mb-2">Total Users</div>
                            <div className="text-3xl font-serif text-accent-gold">{overview.users.total}</div>
                            <div className="text-xs text-text-muted mt-2">
                                {overview.users.clients} Clients • {overview.users.providers} Providers
                            </div>
                        </div>
                        <div className="bg-secondary-bg border border-border rounded-xl p-6">
                            <div className="text-[10px] uppercase tracking-widest text-text-muted mb-2">Total Jobs</div>
                            <div className="text-3xl font-serif text-accent-gold">{overview.jobs.total}</div>
                            <div className="text-xs text-text-muted mt-2">
                                {overview.jobs.open} Open • {overview.jobs.completed} Completed
                            </div>
                        </div>
                        <div className="bg-secondary-bg border border-border rounded-xl p-6">
                            <div className="text-[10px] uppercase tracking-widest text-text-muted mb-2">Total Bids</div>
                            <div className="text-3xl font-serif text-accent-gold">{overview.bids.total}</div>
                        </div>
                        <div className="bg-secondary-bg border border-border rounded-xl p-6">
                            <div className="text-[10px] uppercase tracking-widest text-text-muted mb-2">Platform Volume</div>
                            <div className="text-3xl font-serif text-accent-gold">${overview.platform.totalVolume?.toLocaleString()}</div>
                        </div>
                    </div>
                )}

                {/* Users Tab */}
                {activeTab === 'users' && (
                    <div className="bg-secondary-bg border border-border rounded-xl overflow-hidden">
                        <div className="px-6 py-4 border-b border-border bg-primary-bg/30">
                            <h2 className="font-serif text-xl text-text-main">Users Management</h2>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead className="bg-primary-bg/50 text-[10px] uppercase tracking-wider text-text-muted border-b border-border">
                                    <tr>
                                        <th className="px-6 py-4 font-medium">Name</th>
                                        <th className="px-6 py-4 font-medium">Email</th>
                                        <th className="px-6 py-4 font-medium">Role</th>
                                        <th className="px-6 py-4 font-medium">Company</th>
                                        <th className="px-6 py-4 font-medium text-right">Wallet</th>
                                        <th className="px-6 py-4 font-medium text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-border/50">
                                    {users.users?.map((u) => (
                                        <tr key={u._id} className="hover:bg-white/5">
                                            <td className="px-6 py-4 text-sm text-text-main">{u.name}</td>
                                            <td className="px-6 py-4 text-sm text-text-muted">{u.email}</td>
                                            <td className="px-6 py-4">
                                                <span className={`px-2 py-1 rounded text-[10px] uppercase ${
                                                    u.role === 'Admin' ? 'bg-red-500/20 text-red-400' :
                                                    u.role === 'Provider' ? 'bg-blue-500/20 text-blue-400' :
                                                    'bg-green-500/20 text-green-400'
                                                }`}>
                                                    {u.role}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-sm text-text-muted">{u.company || '-'}</td>
                                            <td className="px-6 py-4 text-right font-mono text-sm text-text-main">
                                                ${u.walletBalance?.toFixed(2) || '0.00'}
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <button
                                                    onClick={() => handleDeleteUser(u._id)}
                                                    className="text-red-400 hover:text-red-500 text-xs uppercase tracking-wider"
                                                    disabled={u._id === user?.id}
                                                >
                                                    Delete
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        {users.pagination && (
                            <div className="px-6 py-4 border-t border-border flex justify-between items-center">
                                <div className="text-xs text-text-muted">
                                    Page {users.pagination.page} of {users.pagination.pages}
                                </div>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => setUserPage(p => Math.max(1, p - 1))}
                                        disabled={userPage === 1}
                                        className="px-3 py-1 text-xs border border-border rounded disabled:opacity-50"
                                    >
                                        Previous
                                    </button>
                                    <button
                                        onClick={() => setUserPage(p => Math.min(users.pagination.pages, p + 1))}
                                        disabled={userPage === users.pagination.pages}
                                        className="px-3 py-1 text-xs border border-border rounded disabled:opacity-50"
                                    >
                                        Next
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* Jobs Tab */}
                {activeTab === 'jobs' && (
                    <div className="bg-secondary-bg border border-border rounded-xl overflow-hidden">
                        <div className="px-6 py-4 border-b border-border bg-primary-bg/30">
                            <h2 className="font-serif text-xl text-text-main">Jobs Management</h2>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead className="bg-primary-bg/50 text-[10px] uppercase tracking-wider text-text-muted border-b border-border">
                                    <tr>
                                        <th className="px-6 py-4 font-medium">Title</th>
                                        <th className="px-6 py-4 font-medium">Client</th>
                                        <th className="px-6 py-4 font-medium">Status</th>
                                        <th className="px-6 py-4 font-medium text-right">Budget</th>
                                        <th className="px-6 py-4 font-medium text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-border/50">
                                    {jobs.jobs?.map((job) => (
                                        <tr key={job._id} className="hover:bg-white/5">
                                            <td className="px-6 py-4 text-sm text-text-main">{job.title}</td>
                                            <td className="px-6 py-4 text-sm text-text-muted">{job.client?.name || '-'}</td>
                                            <td className="px-6 py-4">
                                                <select
                                                    value={job.status}
                                                    onChange={(e) => handleUpdateJobStatus(job._id, e.target.value)}
                                                    className="bg-primary-bg border border-border rounded px-2 py-1 text-xs text-text-main"
                                                >
                                                    <option value="Open">Open</option>
                                                    <option value="Contracted">Contracted</option>
                                                    <option value="In-Progress">In-Progress</option>
                                                    <option value="Reviewing">Reviewing</option>
                                                    <option value="Completed">Completed</option>
                                                </select>
                                            </td>
                                            <td className="px-6 py-4 text-right font-mono text-sm text-text-main">
                                                ${job.budget?.toLocaleString()}
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <button
                                                    onClick={() => handleDeleteJob(job._id)}
                                                    className="text-red-400 hover:text-red-500 text-xs uppercase tracking-wider"
                                                >
                                                    Delete
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        {jobs.pagination && (
                            <div className="px-6 py-4 border-t border-border flex justify-between items-center">
                                <div className="text-xs text-text-muted">
                                    Page {jobs.pagination.page} of {jobs.pagination.pages}
                                </div>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => setJobPage(p => Math.max(1, p - 1))}
                                        disabled={jobPage === 1}
                                        className="px-3 py-1 text-xs border border-border rounded disabled:opacity-50"
                                    >
                                        Previous
                                    </button>
                                    <button
                                        onClick={() => setJobPage(p => Math.min(jobs.pagination.pages, p + 1))}
                                        disabled={jobPage === jobs.pagination.pages}
                                        className="px-3 py-1 text-xs border border-border rounded disabled:opacity-50"
                                    >
                                        Next
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* Transactions Tab */}
                {activeTab === 'transactions' && (
                    <div className="bg-secondary-bg border border-border rounded-xl overflow-hidden">
                        <div className="px-6 py-4 border-b border-border bg-primary-bg/30">
                            <h2 className="font-serif text-xl text-text-main">Recent Transactions</h2>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead className="bg-primary-bg/50 text-[10px] uppercase tracking-wider text-text-muted border-b border-border">
                                    <tr>
                                        <th className="px-6 py-4 font-medium">User</th>
                                        <th className="px-6 py-4 font-medium">Type</th>
                                        <th className="px-6 py-4 font-medium">Amount</th>
                                        <th className="px-6 py-4 font-medium">Balance After</th>
                                        <th className="px-6 py-4 font-medium">Date</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-border/50">
                                    {transactions.transactions?.map((tx) => (
                                        <tr key={tx._id} className="hover:bg-white/5">
                                            <td className="px-6 py-4 text-sm text-text-main">{tx.user?.name || '-'}</td>
                                            <td className="px-6 py-4 text-sm text-text-muted">{tx.type}</td>
                                            <td className={`px-6 py-4 font-mono text-sm ${tx.amount > 0 ? 'text-green-400' : 'text-red-400'}`}>
                                                {tx.amount > 0 ? '+' : ''}${tx.amount?.toFixed(2)}
                                            </td>
                                            <td className="px-6 py-4 font-mono text-sm text-text-main">
                                                ${tx.balanceAfter?.toFixed(2)}
                                            </td>
                                            <td className="px-6 py-4 text-xs text-text-muted">
                                                {new Date(tx.createdAt).toLocaleString()}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
};

export default AdminDashboard;
