import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';

const CreateJob = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        category: 'Legal', // Default
        budget: '',
        location: ''
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            await api.post('/jobs', formData);
            navigate('/dashboard');
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to create job');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-primary-bg text-text-main p-6 flex flex-col items-center">
            <div className="w-full max-w-2xl">
                <div className="mb-8">
                    <button
                        onClick={() => navigate('/dashboard')}
                        className="text-text-muted hover:text-accent-gold text-xs uppercase tracking-wider mb-4 flex items-center gap-2 transition-colors"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
                        Back to Dashboard
                    </button>
                    <h1 className="font-serif text-3xl text-text-main">Create New Engagement</h1>
                    <p className="text-text-muted text-sm mt-1">Define the parameters for your service request.</p>
                </div>

                <div className="bg-secondary-bg border border-border rounded-xl p-8 shadow-xl">
                    {error && (
                        <div className="bg-red-500/10 text-red-400 px-4 py-3 mb-6 text-sm border border-red-500/20 rounded-lg">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-1">
                            <label className="text-xs uppercase tracking-wider text-text-muted font-medium ml-1">Job Title</label>
                            <input
                                type="text"
                                name="title"
                                value={formData.title}
                                onChange={handleChange}
                                className="w-full bg-primary-bg/50 border border-border rounded-lg px-4 py-3 text-text-main focus:outline-none focus:border-accent-gold focus:ring-1 focus:ring-accent-gold transition-all placeholder-gray-600"
                                placeholder="e.g. Corporate Legal Consultation"
                                required
                            />
                        </div>

                        <div className="space-y-1">
                            <label className="text-xs uppercase tracking-wider text-text-muted font-medium ml-1">Description</label>
                            <textarea
                                name="description"
                                value={formData.description}
                                onChange={handleChange}
                                rows="4"
                                className="w-full bg-primary-bg/50 border border-border rounded-lg px-4 py-3 text-text-main focus:outline-none focus:border-accent-gold focus:ring-1 focus:ring-accent-gold transition-all placeholder-gray-600"
                                placeholder="Detailed requirements..."
                                required
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-1">
                                <label className="text-xs uppercase tracking-wider text-text-muted font-medium ml-1">Category</label>
                                <select
                                    name="category"
                                    value={['Legal', 'Financial', 'Technology', 'Consulting'].includes(formData.category) ? formData.category : 'Other'}
                                    onChange={(e) => {
                                        if (e.target.value === 'Other') {
                                            setFormData({ ...formData, category: '' });
                                        } else {
                                            setFormData({ ...formData, category: e.target.value });
                                        }
                                    }}
                                    className="w-full bg-primary-bg/50 border border-border rounded-lg px-4 py-3 text-text-main focus:outline-none focus:border-accent-gold focus:ring-1 focus:ring-accent-gold transition-all"
                                >
                                    <option value="Legal">Legal</option>
                                    <option value="Financial">Financial</option>
                                    <option value="Technology">Technology</option>
                                    <option value="Consulting">Consulting</option>
                                    <option value="Other">Other (Specify)</option>
                                </select>
                                {(!['Legal', 'Financial', 'Technology', 'Consulting'].includes(formData.category) || formData.category === '') && (
                                    <input
                                        type="text"
                                        name="customCategory"
                                        value={formData.category} // We use the same state
                                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                        className="mt-2 w-full bg-primary-bg/50 border border-border rounded-lg px-4 py-3 text-text-main focus:outline-none focus:border-accent-gold focus:ring-1 focus:ring-accent-gold transition-all placeholder-gray-600 animate-fade-in"
                                        placeholder="Type your category..."
                                        required
                                    />
                                )}
                            </div>

                            <div className="space-y-1">
                                <label className="text-xs uppercase tracking-wider text-text-muted font-medium ml-1">Budget ($)</label>
                                <input
                                    type="number"
                                    name="budget"
                                    value={formData.budget}
                                    onChange={handleChange}
                                    className="w-full bg-primary-bg/50 border border-border rounded-lg px-4 py-3 text-text-main focus:outline-none focus:border-accent-gold focus:ring-1 focus:ring-accent-gold transition-all placeholder-gray-600"
                                    placeholder="e.g. 5000"
                                    required
                                />
                            </div>
                        </div>

                        <div className="space-y-1">
                            <label className="text-xs uppercase tracking-wider text-text-muted font-medium ml-1">Location</label>
                            <input
                                type="text"
                                name="location"
                                value={formData.location}
                                onChange={handleChange}
                                className="w-full bg-primary-bg/50 border border-border rounded-lg px-4 py-3 text-text-main focus:outline-none focus:border-accent-gold focus:ring-1 focus:ring-accent-gold transition-all placeholder-gray-600"
                                placeholder="e.g. Remote / New York, NY"
                                required
                            />
                        </div>

                        <div className="pt-4 flex gap-4">
                            <button
                                type="button"
                                onClick={() => navigate('/dashboard')}
                                className="flex-1 bg-transparent border border-border text-text-muted py-3 font-bold uppercase tracking-widest text-xs rounded-lg hover:bg-white/5 transition-all"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={loading}
                                className="flex-1 bg-gradient-to-r from-accent-gold to-yellow-600 text-primary-bg py-3 font-bold uppercase tracking-widest text-xs rounded-lg hover:shadow-lg hover:shadow-accent-gold/20 transition-all duration-300 disabled:opacity-50"
                            >
                                {loading ? 'Processing...' : 'Post Engagement'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default CreateJob;
