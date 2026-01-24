import { useState, useEffect } from 'react';
import api from '../utils/api';

const WalletFundingModal = ({ isOpen, onClose, onSuccess }) => {
    const [amount, setAmount] = useState('');
    const [customAmount, setCustomAmount] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const presetAmounts = [500, 1000, 5000, 10000];

    const handleFundWallet = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const fundAmount = amount === 'custom' ? parseFloat(customAmount) : parseFloat(amount);

            if (!fundAmount || fundAmount < 1) {
                setError('Please enter a valid amount (minimum $1)');
                setLoading(false);
                return;
            }

            // Simple API call without payment methods
            const res = await api.post('/payments/fund-wallet', {
                amount: fundAmount
            });

            setLoading(false);
            onSuccess(res.data.walletBalance);
            onClose();

            // Reset form
            setAmount('');
            setCustomAmount('');
        } catch (err) {
            setLoading(false);
            setError(err.response?.data?.error || 'Funding failed. Please try again.');
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-secondary-bg border border-border rounded-2xl max-w-md w-full p-8 shadow-2xl">
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h2 className="font-serif text-2xl text-text-main">Add Funds</h2>
                        <p className="text-[10px] text-accent-gold uppercase tracking-wider font-bold mt-1">Test Mode Active</p>
                    </div>
                    <button onClick={onClose} className="text-text-muted hover:text-text-main transition-colors">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                        </svg>
                    </button>
                </div>

                <form onSubmit={handleFundWallet} className="space-y-6">
                    {/* Amount Selection */}
                    <div>
                        <label className="text-[10px] uppercase tracking-wider text-text-muted font-bold block mb-3">Select Amount to Simulate</label>
                        <div className="grid grid-cols-2 gap-2 mb-2">
                            {presetAmounts.map(preset => (
                                <button
                                    key={preset}
                                    type="button"
                                    onClick={() => { setAmount(preset.toString()); setCustomAmount(''); }}
                                    className={`py-3 rounded-lg border font-mono text-sm transition-all ${amount === preset.toString()
                                        ? 'bg-accent-gold text-primary-bg border-accent-gold'
                                        : 'bg-primary-bg border-border text-text-main hover:border-accent-gold'
                                        }`}
                                >
                                    ${preset.toLocaleString()}
                                </button>
                            ))}
                        </div>
                        <button
                            type="button"
                            onClick={() => setAmount('custom')}
                            className={`w-full py-3 rounded-lg border font-mono text-sm transition-all ${amount === 'custom'
                                ? 'bg-accent-gold text-primary-bg border-accent-gold'
                                : 'bg-primary-bg border-border text-text-main hover:border-accent-gold'
                                }`}
                        >
                            Custom Amount
                        </button>

                        {amount === 'custom' && (
                            <input
                                type="number"
                                value={customAmount}
                                onChange={(e) => setCustomAmount(e.target.value)}
                                placeholder="Enter amount"
                                className="w-full mt-2 bg-primary-bg border border-border rounded-lg px-4 py-3 text-text-main focus:border-accent-gold focus:outline-none"
                                min="1"
                                step="0.01"
                            />
                        )}
                    </div>

                    {error && (
                        <div className="bg-red-500/10 border border-red-500 rounded-lg p-3 text-red-400 text-sm">
                            {error}
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={loading || !amount || (amount === 'custom' && !customAmount)}
                        className="w-full bg-accent-gold text-primary-bg py-3 rounded-lg font-bold text-sm uppercase tracking-wider hover:bg-yellow-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? 'Processing...' : 'Deposit Funds (Simulated)'}
                    </button>

                    <p className="text-center text-[10px] text-text-muted">
                        No real money will be charged. This is a simulation.
                    </p>
                </form>
            </div>
        </div>
    );
};

export default WalletFundingModal;
