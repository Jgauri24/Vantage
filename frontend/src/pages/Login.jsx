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
        <div className="min-h-screen flex items-center justify-center px-4 bg-primary-bg">
            <div className="w-full max-w-[400px]">
                <div className="text-center mb-12">
                    <h1 className="font-serif text-5xl text-black mb-2 tracking-tighter">VANTAGE</h1>
                    <div className="h-1 w-12 bg-accent-red mx-auto"></div>
                </div>

                <div className="bg-white p-8">
                    <h2 className="font-sans text-xl font-semibold text-black mb-8 uppercase tracking-widest text-center">Authentication</h2>

                    {error && (
                        <div className="bg-red-50 text-accent-red px-4 py-3 mb-6 text-sm border-l-2 border-accent-red">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="relative group">
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full bg-transparent border-b border-gray-300 py-3 text-black focus:outline-none focus:border-accent-red transition-colors placeholder-transparent peer"
                                placeholder="Email"
                                required
                            />
                            <label className="absolute left-0 top-3 text-text-muted text-sm transition-all peer-focus:-top-3 peer-focus:text-xs peer-focus:text-accent-red peer-not-placeholder-shown:-top-3 peer-not-placeholder-shown:text-xs peer-not-placeholder-shown:text-text-muted cursor-text">
                                Email Address
                            </label>
                        </div>

                        <div className="relative group">
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full bg-transparent border-b border-gray-300 py-3 text-black focus:outline-none focus:border-accent-red transition-colors placeholder-transparent peer"
                                placeholder="Password"
                                required
                            />
                            <label className="absolute left-0 top-3 text-text-muted text-sm transition-all peer-focus:-top-3 peer-focus:text-xs peer-focus:text-accent-red peer-not-placeholder-shown:-top-3 peer-not-placeholder-shown:text-xs peer-not-placeholder-shown:text-text-muted cursor-text">
                                Password
                            </label>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-black text-white py-4 font-medium uppercase tracking-widest text-xs hover:bg-accent-red transition-all duration-300 disabled:opacity-50 mt-8"
                        >
                            {loading ? 'Processing...' : 'Enter Vantage'}
                        </button>
                    </form>

                    <p className="mt-10 text-center text-text-muted text-xs uppercase tracking-wide">
                        New to Vantage?{' '}
                        <Link to="/register" className="text-black hover:text-accent-red font-bold transition-colors">
                            Request Access
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Login;
