import { useEffect, useState } from 'react';
import api from '../utils/api';

const ProviderProfileModal = ({ providerId, isOpen, onClose }) => {
    const [loading, setLoading] = useState(false);
    const [provider, setProvider] = useState(null);
    const [error, setError] = useState('');

    useEffect(() => {
        if (isOpen && providerId) {
            fetchProvider();
        }
    }, [isOpen, providerId]);

    const fetchProvider = async () => {
        setLoading(true);
        setError('');
        try {
            const res = await api.get(`/users/${providerId}`);
            setProvider(res.data);
        } catch (err) {
            setError('Failed to load profile.');
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    const skills = provider?.skills || [];
    const portfolioLinks = provider?.portfolioLinks || [];

    return (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/60 px-4">
            <div className="bg-secondary-bg border border-border rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                <div className="flex items-center justify-between px-6 py-4 border-b border-border">
                    <h2 className="font-serif text-xl text-text-main">Provider Profile</h2>
                    <button
                        onClick={onClose}
                        className="text-text-muted hover:text-accent-gold text-sm"
                    >
                        Close
                    </button>
                </div>

                <div className="p-6 space-y-6">
                    {loading ? (
                        <div className="flex justify-center py-10">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent-gold"></div>
                        </div>
                    ) : error ? (
                        <div className="text-sm text-red-400">{error}</div>
                    ) : provider ? (
                        <>
                            <div className="flex gap-4">
                                <div className="w-16 h-16 rounded-full bg-primary-bg border-2 border-accent-gold flex items-center justify-center text-2xl font-serif text-text-main">
                                    {provider.name?.charAt(0)}
                                </div>
                                <div>
                                    <h3 className="text-xl font-serif text-text-main">{provider.name}</h3>
                                    <div className="text-xs text-text-muted mb-1">{provider.email}</div>
                                    <div className="flex flex-wrap gap-3 text-xs text-text-muted">
                                        {provider.location && (
                                            <span className="flex items-center gap-1">
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path>
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path>
                                                </svg>
                                                {provider.location}
                                            </span>
                                        )}
                                        {provider.company && (
                                            <span className="flex items-center gap-1">
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path>
                                                </svg>
                                                {provider.company}
                                            </span>
                                        )}
                                        {provider.yearsOfExperience && (
                                            <span>{provider.yearsOfExperience}+ yrs experience</span>
                                        )}
                                    </div>
                                    {provider.headline && (
                                        <div className="mt-2 text-sm text-text-main">
                                            {provider.headline}
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="border-t border-border pt-4">
                                <h4 className="text-xs font-bold uppercase tracking-widest text-text-muted mb-2">About</h4>
                                <p className="text-sm text-text-main whitespace-pre-wrap">
                                    {provider.bio || 'No bio provided.'}
                                </p>
                            </div>

                            {provider.experience && (
                                <div className="border-t border-border pt-4">
                                    <h4 className="text-xs font-bold uppercase tracking-widest text-text-muted mb-2">Experience</h4>
                                    <p className="text-sm text-text-main whitespace-pre-wrap">
                                        {provider.experience}
                                    </p>
                                </div>
                            )}

                            <div className="border-t border-border pt-4">
                                <h4 className="text-xs font-bold uppercase tracking-widest text-text-muted mb-2">Skills</h4>
                                <div className="flex flex-wrap gap-2">
                                    {skills.length > 0 ? (
                                        skills.map((s) => (
                                            <span
                                                key={s}
                                                className="px-3 py-1 bg-primary-bg border border-border rounded-full text-xs text-text-main"
                                            >
                                                {s}
                                            </span>
                                        ))
                                    ) : (
                                        <span className="text-sm text-text-muted italic">No skills listed.</span>
                                    )}
                                </div>
                            </div>

                            <div className="border-t border-border pt-4">
                                <h4 className="text-xs font-bold uppercase tracking-widest text-text-muted mb-2">Portfolio</h4>
                                {portfolioLinks.length > 0 ? (
                                    <ul className="space-y-2 text-sm">
                                        {portfolioLinks.map((link) => (
                                            <li key={link}>
                                                <a
                                                    href={link}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="text-accent-gold hover:underline break-all"
                                                >
                                                    {link}
                                                </a>
                                            </li>
                                        ))}
                                    </ul>
                                ) : (
                                    <p className="text-sm text-text-muted italic">No portfolio links added.</p>
                                )}
                            </div>
                        </>
                    ) : null}
                </div>
            </div>
        </div>
    );
};

export default ProviderProfileModal;

