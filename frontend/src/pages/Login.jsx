import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            await login(email, password);
            navigate('/dashboard');
        } catch (err) {
            setError(err.response?.data?.error || 'Login failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center px-4 bg-primary-bg bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-secondary-bg to-primary-bg">
            <div className="w-full max-w-[400px]">
                <div className="text-center mb-10">
                    <p className="text-accent-gold text-xs uppercase tracking-[0.2em] mb-2 font-medium">Professional Services</p>
                    <h1 className="font-serif text-5xl text-text-main tracking-tight mb-6">Vantage</h1>
                </div>

                <div className="bg-secondary-bg/50 backdrop-blur-xl border border-border p-8 rounded-2xl shadow-2xl">
                    <h2 className="font-sans text-sm font-semibold text-text-main mb-6 uppercase tracking-widest text-center border-b border-border pb-4">
                        Executive Login
                    </h2>

                    {error && (
                        <div className="bg-red-500/10 text-red-400 px-4 py-3 mb-6 text-sm border border-red-500/20 rounded-lg text-center">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div className="space-y-1">
                            <label className="text-xs uppercase tracking-wider text-text-muted font-medium ml-1">Email</label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full bg-primary-bg/50 border border-border rounded-lg px-4 py-3 text-text-main focus:outline-none focus:border-accent-gold focus:ring-1 focus:ring-accent-gold transition-all placeholder-gray-600"
                                placeholder="name@company.com"
                                required
                            />
                        </div>

                        <div className="space-y-1">
                            <label className="text-xs uppercase tracking-wider text-text-muted font-medium ml-1">Password</label>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full bg-primary-bg/50 border border-border rounded-lg px-4 py-3 text-text-main focus:outline-none focus:border-accent-gold focus:ring-1 focus:ring-accent-gold transition-all placeholder-gray-600"
                                placeholder="••••••••"
                                required
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-gradient-to-r from-accent-gold to-yellow-600 text-primary-bg py-3.5 font-bold uppercase tracking-widest text-xs rounded-lg hover:shadow-lg hover:shadow-accent-gold/20 transition-all duration-300 disabled:opacity-50 mt-2"
                        >
                            {loading ? 'Authenticating...' : 'Access Terminal'}
                        </button>
                    </form>

                    <p className="mt-8 text-center text-text-muted text-xs">
                        Not part of the network?{' '}
                        <Link to="/register" className="text-accent-gold hover:text-white transition-colors font-medium">
                            Apply for Access
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Login;
