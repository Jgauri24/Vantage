import { useState, useEffect } from 'react';
import { CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import api from '../utils/api';

const WalletFundingModal = ({ isOpen, onClose, onSuccess }) => {
    const stripe = useStripe();
    const elements = useElements();

    const [amount, setAmount] = useState('');
    const [customAmount, setCustomAmount] = useState('');
    const [savedMethods, setSavedMethods] = useState([]);
    const [selectedMethod, setSelectedMethod] = useState(null);
    const [useNewCard, setUseNewCard] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const presetAmounts = [50, 100, 250, 500];

    useEffect(() => {
        if (isOpen) {
            fetchPaymentMethods();
        }
    }, [isOpen]);

    const fetchPaymentMethods = async () => {
        try {
            const res = await api.get('/payments/payment-methods');
            setSavedMethods(res.data);

            // Auto-select default method
            const defaultMethod = res.data.find(pm => pm.isDefault);
            if (defaultMethod) {
                setSelectedMethod(defaultMethod.paymentMethodId);
            }
        } catch (err) {
            console.error('Failed to fetch payment methods:', err);
        }
    };

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

            if (fundAmount > 10000) {
                setError('Maximum funding amount is $10,000');
                setLoading(false);
                return;
            }

            let paymentMethodId = selectedMethod;

            // If using new card, create setup intent and save card
            if (useNewCard) {
                if (!stripe || !elements) {
                    setError('Stripe not loaded');
                    setLoading(false);
                    return;
                }

                // Create setup intent
                const setupRes = await api.post('/payments/create-setup-intent');
                const { clientSecret } = setupRes.data;

                // Confirm card setup
                const { setupIntent, error: setupError } = await stripe.confirmCardSetup(
                    clientSecret,
                    {
                        payment_method: {
                            card: elements.getElement(CardElement),
                        }
                    }
                );

                if (setupError) {
                    setError(setupError.message);
                    setLoading(false);
                    return;
                }

                paymentMethodId = setupIntent.payment_method;

                // Save payment method
                await api.post('/payments/save-payment-method', {
                    paymentMethodId,
                    setAsDefault: savedMethods.length === 0
                });
            }

            if (!paymentMethodId) {
                setError('Please select a payment method');
                setLoading(false);
                return;
            }

            // Fund wallet
            const res = await api.post('/payments/fund-wallet', {
                amount: fundAmount,
                paymentMethodId
            });

            setLoading(false);
            onSuccess(res.data.walletBalance);
            onClose();

            // Reset form
            setAmount('');
            setCustomAmount('');
            setUseNewCard(false);
        } catch (err) {
            setLoading(false);
            setError(err.response?.data?.error || 'Payment failed. Please try again.');
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-secondary-bg border border-border rounded-2xl max-w-md w-full p-8 shadow-2xl">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="font-serif text-2xl text-text-main">Fund Wallet</h2>
                    <button onClick={onClose} className="text-text-muted hover:text-text-main transition-colors">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                        </svg>
                    </button>
                </div>

                <form onSubmit={handleFundWallet} className="space-y-6">
                    {/* Amount Selection */}
                    <div>
                        <label className="text-[10px] uppercase tracking-wider text-text-muted font-bold block mb-3">Select Amount</label>
                        <div className="grid grid-cols-4 gap-2 mb-2">
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
                                    ${preset}
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
                                max="10000"
                                step="0.01"
                            />
                        )}
                    </div>

                    {/* Payment Method Selection */}
                    <div>
                        <label className="text-[10px] uppercase tracking-wider text-text-muted font-bold block mb-3">Payment Method</label>

                        {savedMethods.length > 0 && !useNewCard && (
                            <div className="space-y-2 mb-3">
                                {savedMethods.map(method => (
                                    <button
                                        key={method.paymentMethodId}
                                        type="button"
                                        onClick={() => setSelectedMethod(method.paymentMethodId)}
                                        className={`w-full p-4 rounded-lg border flex items-center justify-between transition-all ${selectedMethod === method.paymentMethodId
                                                ? 'bg-accent-gold/10 border-accent-gold'
                                                : 'bg-primary-bg border-border hover:border-accent-gold'
                                            }`}
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-7 bg-primary-bg rounded flex items-center justify-center text-xs font-bold uppercase">
                                                {method.brand}
                                            </div>
                                            <div className="text-left">
                                                <div className="text-text-main">•••• {method.last4}</div>
                                                <div className="text-xs text-text-muted">Expires {method.expMonth}/{method.expYear}</div>
                                            </div>
                                        </div>
                                        {method.isDefault && (
                                            <span className="text-xs bg-accent-gold text-primary-bg px-2 py-1 rounded">Default</span>
                                        )}
                                    </button>
                                ))}
                            </div>
                        )}

                        {!useNewCard && (
                            <button
                                type="button"
                                onClick={() => setUseNewCard(true)}
                                className="w-full py-3 rounded-lg border border-dashed border-border text-text-muted hover:border-accent-gold hover:text-accent-gold transition-colors text-sm"
                            >
                                + Add New Card
                            </button>
                        )}

                        {useNewCard && (
                            <div className="space-y-3">
                                <div className="bg-primary-bg border border-border rounded-lg p-4">
                                    <CardElement
                                        options={{
                                            style: {
                                                base: {
                                                    fontSize: '16px',
                                                    color: '#e5e7eb',
                                                    '::placeholder': {
                                                        color: '#6b7280',
                                                    },
                                                },
                                                invalid: {
                                                    color: '#ef4444',
                                                },
                                            },
                                        }}
                                    />
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setUseNewCard(false)}
                                    className="text-sm text-text-muted hover:text-text-main"
                                >
                                    ← Back to saved cards
                                </button>
                            </div>
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
                        {loading ? 'Processing...' : `Add ${amount === 'custom' ? customAmount ? `$${customAmount}` : 'Funds' : `$${amount}`}`}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default WalletFundingModal;
