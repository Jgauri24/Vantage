import { useAuth } from '../context/AuthContext';

const Dashboard = () => {
    const { user, logout } = useAuth();

    return (
        <div className="min-h-screen bg-secondary-bg">
            <header className="bg-white border-b border-border sticky top-0 z-10">
                <div className="max-w-[1400px] mx-auto px-8 h-20 flex justify-between items-center">
                    <div className="flex items-center gap-4">
                        <h1 className="font-serif text-3xl tracking-tighter text-black">VANTAGE</h1>
                        <div className="h-6 w-[1px] bg-border mx-2"></div>
                        <span className="text-xs font-mono uppercase tracking-widest text-text-muted">Executive Suite</span>
                    </div>

                    <div className="flex items-center gap-8">
                        <div className="text-right hidden md:block">
                            <p className="font-medium text-sm text-black">{user?.name}</p>
                            <div className="flex items-center justify-end gap-2">
                                <div className="w-2 h-2 rounded-full bg-accent-red"></div>
                                <p className="text-[10px] font-mono uppercase tracking-widest text-text-muted">{user?.role}</p>
                            </div>
                        </div>
                        <button
                            onClick={logout}
                            className="text-black text-xs font-bold uppercase tracking-widest hover:text-accent-red transition-colors border border-black hover:border-accent-red px-6 py-2"
                        >
                            Log Out
                        </button>
                    </div>
                </div>
            </header>

            <main className="max-w-[1400px] mx-auto px-8 py-12">
                <div className="grid grid-cols-12 gap-8">
                    {/* Sidebar Area */}
                    <div className="col-span-12 lg:col-span-3">
                        <div className="bg-white p-6 border border-border">
                            <div className="mb-8">
                                <p className="text-xs text-text-muted uppercase tracking-widest mb-2">Account ID</p>
                                <p className="font-mono text-sm break-all">{user?.id}</p>
                            </div>

                            <div className="mb-8">
                                <p className="text-xs text-text-muted uppercase tracking-widest mb-2">Email</p>
                                <p className="text-sm font-medium">{user?.email}</p>
                            </div>

                            {user?.company && (
                                <div className="mb-8">
                                    <p className="text-xs text-text-muted uppercase tracking-widest mb-2">Organization</p>
                                    <p className="text-sm font-medium">{user.company}</p>
                                </div>
                            )}

                            <div className="pt-6 border-t border-border mt-6">
                                <div className="flex items-center justify-between text-xs mb-2">
                                    <span className="text-text-muted">Status</span>
                                    <span className="text-accent-red font-bold uppercase">Active</span>
                                </div>
                                <div className="flex items-center justify-between text-xs">
                                    <span className="text-text-muted">Verification</span>
                                    <span className="text-black font-bold uppercase">Level 1</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Main Content Area */}
                    <div className="col-span-12 lg:col-span-9 space-y-8">
                        <div className="bg-black text-white p-10 flex justify-between items-end relative overflow-hidden">
                            <div className="relative z-10">
                                <p className="text-accent-red font-mono text-xs uppercase tracking-widest mb-4">Welcome Back</p>
                                <h2 className="font-serif text-4xl md:text-5xl tracking-tight mb-2">
                                    {user?.name}
                                </h2>
                                <p className="text-white/60 text-sm max-w-md">
                                    Your executive dashboard is ready. Manage your professional engagements and monitor active contracts.
                                </p>
                            </div>
                            <div className="absolute top-0 right-0 w-64 h-64 bg-accent-red/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl"></div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <button className="group bg-white p-8 border border-border hover:border-accent-red transition-colors text-left">
                                <div className="h-10 w-10 bg-secondary-bg flex items-center justify-center mb-6 group-hover:bg-accent-red group-hover:text-white transition-colors">
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 4v16m8-8H4"></path></svg>
                                </div>
                                <h3 className="font-sans font-bold text-lg mb-2">New Engagement</h3>
                                <p className="text-text-muted text-xs">Create a new job posting or service request.</p>
                            </button>

                            <button className="group bg-white p-8 border border-border hover:border-accent-red transition-colors text-left">
                                <div className="h-10 w-10 bg-secondary-bg flex items-center justify-center mb-6 group-hover:bg-accent-red group-hover:text-white transition-colors">
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
                                </div>
                                <h3 className="font-sans font-bold text-lg mb-2">Browse Network</h3>
                                <p className="text-text-muted text-xs">Explore available providers and verified partners.</p>
                            </button>

                            <button className="group bg-white p-8 border border-border hover:border-accent-red transition-colors text-left">
                                <div className="h-10 w-10 bg-secondary-bg flex items-center justify-center mb-6 group-hover:bg-accent-red group-hover:text-white transition-colors">
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path></svg>
                                </div>
                                <h3 className="font-sans font-bold text-lg mb-2">Performance</h3>
                                <p className="text-text-muted text-xs">View analytics and financial reports.</p>
                            </button>
                        </div>

                        <div className="bg-white border border-border">
                            <div className="px-8 py-6 border-b border-border flex justify-between items-center">
                                <h3 className="font-serif text-xl">Active Ledger</h3>
                                <button className="text-xs font-bold uppercase tracking-widest text-accent-red hover:underline">View All</button>
                            </div>
                            <div className="p-12 text-center">
                                <p className="text-text-muted text-sm italic">No active engagements on the ledger.</p>
                                <p className="text-xs text-text-muted mt-2">New transactions will appear here.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default Dashboard;
