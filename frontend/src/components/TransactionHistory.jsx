import { useState, useEffect } from 'react';
import api from '../utils/api';

const TransactionHistory = ({ limit = 10 }) => {
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all');

    useEffect(() => {
        fetchTransactions();
    }, [filter]);

    const fetchTransactions = async () => {
        try {
            const params = filter !== 'all' ? { type: filter, limit } : { limit };
            const res = await api.get('/payments/transactions', { params });
            setTransactions(res.data);
        } catch (err) {
            console.error('Failed to fetch transactions:', err);
        } finally {
            setLoading(false);
        }
    };

    const getTransactionIcon = (type) => {
        switch (type) {
            case 'wallet_funding':
                return (
                    <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center">
                        <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
                        </svg>
                    </div>
                );
            case 'job_payment':
                return (
                    <div className="w-10 h-10 rounded-full bg-red-500/20 flex items-center justify-center">
                        <svg className="w-5 h-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 12H4"></path>
                        </svg>
                    </div>
                );
            case 'job_earning':
                return (
                    <div className="w-10 h-10 rounded-full bg-accent-gold/20 flex items-center justify-center">
                        <svg className="w-5 h-5 text-accent-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                        </svg>
                    </div>
                );
            default:
                return (
                    <div className="w-10 h-10 rounded-full bg-gray-500/20 flex items-center justify-center">
                        <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path>
                        </svg>
                    </div>
                );
        }
    };

    const getTransactionColor = (type) => {
        switch (type) {
            case 'wallet_funding':
            case 'job_earning':
                return 'text-green-400';
            case 'job_payment':
                return 'text-red-400';
            default:
                return 'text-text-main';
        }
    };

    const formatDate = (date) => {
        return new Date(date).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent-gold"></div>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {/* Filter Buttons */}
            <div className="flex gap-2 flex-wrap">
                {['all', 'wallet_funding', 'job_payment', 'job_earning'].map(filterType => (
                    <button
                        key={filterType}
                        onClick={() => setFilter(filterType)}
                        className={`px-4 py-2 rounded-lg text-xs uppercase tracking-wider font-bold transition-all ${filter === filterType
                                ? 'bg-accent-gold text-primary-bg'
                                : 'bg-primary-bg border border-border text-text-muted hover:border-accent-gold'
                            }`}
                    >
                        {filterType === 'all' ? 'All' : filterType.replace('_', ' ')}
                    </button>
                ))}
            </div>

            {/* Transactions List */}
            {transactions.length === 0 ? (
                <div className="text-center py-12 text-text-muted">
                    <svg className="w-16 h-16 mx-auto mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path>
                    </svg>
                    <p>No transactions found</p>
                </div>
            ) : (
                <div className="space-y-3">
                    {transactions.map(transaction => (
                        <div
                            key={transaction._id}
                            className="bg-primary-bg border border-border rounded-xl p-4 hover:border-accent-gold/50 transition-colors"
                        >
                            <div className="flex items-start gap-4">
                                {getTransactionIcon(transaction.type)}
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-start justify-between gap-4">
                                        <div className="flex-1">
                                            <h4 className="text-text-main font-medium mb-1">
                                                {transaction.description}
                                            </h4>
                                            <p className="text-xs text-text-muted">
                                                {formatDate(transaction.createdAt)}
                                            </p>
                                            {transaction.relatedJob && (
                                                <p className="text-xs text-accent-gold mt-1">
                                                    Job: {transaction.relatedJob.title}
                                                </p>
                                            )}
                                        </div>
                                        <div className="text-right">
                                            <div className={`text-lg font-mono font-bold ${getTransactionColor(transaction.type)}`}>
                                                {transaction.amount >= 0 ? '+' : ''}${Math.abs(transaction.amount).toFixed(2)}
                                            </div>
                                            <div className="text-xs text-text-muted">
                                                Balance: ${transaction.balanceAfter.toFixed(2)}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default TransactionHistory;
