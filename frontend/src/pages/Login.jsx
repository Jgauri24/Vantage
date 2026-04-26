import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { GoogleLogin } from '@react-oauth/google';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { login, googleLogin } = useAuth();
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

    const handleGoogleSuccess = async (credentialResponse) => {
        setError('');
        setLoading(true);
        try {
            await googleLogin(credentialResponse.credential);
            navigate('/dashboard');
        } catch (err) {
            setError(err.response?.data?.error || 'Google login failed.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center px-4 bg-[var(--color-primary-bg)] relative overflow-hidden">
            {/* Elegant architectural background lines */}
            <div className="absolute inset-0 pointer-events-none flex justify-center opacity-30">
                <div className="h-full w-px bg-gradient-to-b from-transparent via-[var(--color-border)] to-transparent mx-32"></div>
                <div className="h-full w-px bg-gradient-to-b from-transparent via-[var(--color-border)] to-transparent mx-32"></div>
            </div>

            <div className="w-full max-w-[440px] relative z-10">
                <div className="text-center mb-12">
                    <div className="w-12 h-12 rounded bg-[var(--color-text-main)] text-[var(--color-primary-bg)] flex items-center justify-center font-serif text-2xl mx-auto mb-6 shadow-xl">V</div>
                    <p className="text-[var(--color-accent-gold-hover)] text-[10px] uppercase tracking-[0.3em] mb-3 font-bold">Vantage Concierge</p>
                    <h1 className="font-serif text-4xl text-[var(--color-text-main)] tracking-tight">Access Terminal</h1>
                </div>

                <div className="card-premium">
                    {error && (
                        <div className="bg-[var(--color-destructive)]/10 text-[var(--color-destructive)] px-4 py-3 mb-6 text-sm border border-[var(--color-destructive)]/20 rounded-lg text-center font-medium">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-[10px] uppercase tracking-[0.15em] text-[var(--color-text-main)] font-bold ml-1 block">Corporate Email</label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="input-premium"
                                placeholder="name@organization.com"
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] uppercase tracking-[0.15em] text-[var(--color-text-main)] font-bold ml-1 block">Security Phrase</label>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="input-premium font-mono tracking-widest text-sm"
                                placeholder="••••••••"
                                required
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full btn-primary text-sm uppercase tracking-[0.15em] font-bold py-4 mt-4"
                        >
                            {loading ? 'Authenticating...' : 'Establish Connection'}
                        </button>
                    </form>

                    <div className="mt-8 flex items-center gap-4">
                        <div className="h-px bg-[var(--color-border)] flex-1"></div>
                        <span className="text-[10px] text-[var(--color-text-muted)] uppercase tracking-[0.2em] font-medium">SSO Access</span>
                        <div className="h-px bg-[var(--color-border)] flex-1"></div>
                    </div>

                    <div className="mt-8 flex justify-center">
                        <GoogleLogin
                            onSuccess={handleGoogleSuccess}
                            onError={() => setError('Google Authentication Failed')}
                            theme="outline"
                            size="large"
                            shape="rectangular"
                            width="100%"
                        />
                    </div>
                </div>
                
                <p className="mt-10 text-center text-[var(--color-text-muted)] text-[11px] uppercase tracking-widest font-medium">
                    Not a member?{' '}
                    <Link to="/register" className="text-[var(--color-text-main)] hover:text-[var(--color-accent-gold-hover)] border-b border-[var(--color-text-main)] hover:border-[var(--color-accent-gold-hover)] pb-0.5 transition-colors">
                        Apply for Access
                    </Link>
                </p>
            </div>
        </div>
    );
};

export default Login;
