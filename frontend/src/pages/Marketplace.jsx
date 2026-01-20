import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';

const Marketplace = () => {
    const navigate = useNavigate();
    const [jobs, setJobs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [filter, setFilter] = useState('All');

    useEffect(() => {
        fetchJobs();
    }, []);

    const fetchJobs = async () => {
        try {
            const res = await api.get('/jobs?status=Open'); // Fetch only Open jobs for marketplace
            setJobs(res.data);
        } catch (err) {
            setError('Failed to fetch opportunities.');
        } finally {
            setLoading(false);
        }
    };

    const filteredJobs = filter === 'All' ? jobs : jobs.filter(job => job.category === filter);

    return (
        <div className="min-h-screen bg-primary-bg text-text-main">
            {/* Header */}
            <header className="bg-secondary-bg/80 backdrop-blur-md border-b border-border sticky top-0 z-20">
                <div className="max-w-7xl mx-auto px-6 h-16 flex justify-between items-center">
                    <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate('/dashboard')}>
                        <div className="w-8 h-8 rounded bg-gradient-to-br from-accent-gold to-yellow-700 flex items-center justify-center text-primary-bg font-serif font-bold text-xl">V</div>
                        <span className="font-serif text-lg tracking-tight text-text-main">Vantage</span>
                    </div>

                    <button
                        onClick={() => navigate('/dashboard')}
                        className="text-text-muted hover:text-accent-gold text-xs uppercase tracking-wider transition-colors"
                    >
                        Return to Dashboard
                    </button>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-6 py-8">
                <div className="flex flex-col md:flex-row justify-between items-end mb-8 gap-4">
                    <div>
                        <h1 className="font-serif text-3xl md:text-4xl text-text-main mb-2">Marketplace</h1>
                        <p className="text-text-muted">Explore active engagement opportunities.</p>
                    </div>

                    <div className="flex gap-2 bg-secondary-bg border border-border p-1 rounded-lg">
                        {['All', 'Legal', 'Financial', 'Tech', 'Consulting'].map((cat) => (
                            <button
                                key={cat}
                                onClick={() => setFilter(cat)}
                                className={`px-4 py-2 rounded text-xs uppercase tracking-wider transition-all ${filter === cat
                                    ? 'bg-accent-gold text-primary-bg font-bold shadow-lg'
                                    : 'text-text-muted hover:text-text-main hover:bg-white/5'
                                    }`}
                            >
                                {cat}
                            </button>
                        ))}
                    </div>
                </div>

                {loading ? (
                    <div className="flex justify-center py-20">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent-gold"></div>
                    </div>
                ) : error ? (
                    <div className="text-center py-20 text-red-400 bg-secondary-bg border border-border rounded-xl">
                        {error}
                    </div>
                ) : filteredJobs.length === 0 ? (
                    <div className="text-center py-20 bg-secondary-bg border border-border rounded-xl text-text-muted">
                        <p className="font-serif text-lg mb-2">No active opportunities found.</p>
                        <p className="text-xs">Check back later or adjust your filters.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredJobs.map((job) => (
                            <div key={job._id} className="group bg-secondary-bg border border-border hover:border-accent-gold/50 rounded-xl p-6 shadow-lg hover:shadow-accent-gold/5 transition-all duration-300 flex flex-col h-full">
                                <div className="flex justify-between items-start mb-4">
                                    <span className="px-2 py-1 rounded-md bg-primary-bg border border-border text-[10px] uppercase tracking-wider text-accent-gold">
                                        {job.category}
                                    </span>
                                    <span className="text-xs text-text-muted font-mono">
                                        ${job.budget?.toLocaleString()}
                                    </span>
                                </div>

                                <h3 className="font-serif text-xl text-text-main mb-2 line-clamp-2 group-hover:text-accent-gold transition-colors">
                                    {job.title}
                                </h3>

                                <p className="text-text-muted text-sm mb-6 line-clamp-3 flex-grow">
                                    {job.description}
                                </p>

                                <div className="mt-auto border-t border-border pt-4 flex justify-between items-center text-xs text-text-muted">
                                    <div className="flex items-center gap-1">
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
                                        {job.location}
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                                        {new Date(job.createdAt).toLocaleDateString()}
                                    </div>
                                </div>

                                <button
                                    onClick={() => navigate(`/jobs/${job._id}`)}
                                    className="w-full mt-4 bg-primary-bg/50 hover:bg-accent-gold hover:text-primary-bg border border-border hover:border-accent-gold text-text-main py-2 rounded-lg text-xs uppercase tracking-widest font-bold transition-all"
                                >
                                    View Details
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </main>
        </div>
    );
};

export default Marketplace;
