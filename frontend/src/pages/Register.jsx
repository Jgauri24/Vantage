import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { GoogleLogin } from '@react-oauth/google';

const Register = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        role: 'Client',
        company: ''
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { register, googleLogin } = useAuth();
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            await register(formData);
            navigate('/dashboard');
        } catch (err) {
            setError(err.response?.data?.error || 'Registration failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleSuccess = async (credentialResponse) => {
        setError('');
        setLoading(true);
        try {
            await googleLogin(credentialResponse.credential, formData.role, formData.company);
            navigate('/dashboard');
        } catch (err) {
            setError(err.response?.data?.error || 'Google registration failed.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center px-4 bg-primary-bg bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-secondary-bg to-primary-bg py-12">
            <div className="w-full max-w-[480px]">
                <div className="text-center mb-10">
                    <p className="text-accent-gold text-xs uppercase tracking-[0.2em] mb-2 font-medium">Join the Network</p>
                    <h1 className="font-serif text-4xl text-text-main tracking-tight">Vantge Membership</h1>
                </div>

                <div className="bg-secondary-bg/50 backdrop-blur-xl border border-border p-8 rounded-2xl shadow-2xl">
                    {error && (
                        <div className="bg-red-500/10 text-red-400 px-4 py-3 mb-6 text-sm border border-red-500/20 rounded-lg text-center">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1">
                                <label className="text-xs uppercase tracking-wider text-text-muted font-medium ml-1">Full Name</label>
                                <input
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    className="w-full bg-primary-bg/50 border border-border rounded-lg px-4 py-3 text-text-main focus:outline-none focus:border-accent-gold focus:ring-1 focus:ring-accent-gold transition-all"
                                    placeholder="John Doe"
                                    required
                                />
                            </div>
                            <div className="space-y-1">
                                <label className="text-xs uppercase tracking-wider text-text-muted font-medium ml-1">Company</label>
                                <input
                                    type="text"
                                    name="company"
                                    value={formData.company}
                                    onChange={handleChange}
                                    className="w-full bg-primary-bg/50 border border-border rounded-lg px-4 py-3 text-text-main focus:outline-none focus:border-accent-gold focus:ring-1 focus:ring-accent-gold transition-all"
                                    placeholder="Inc."
                                />
                            </div>
                        </div>

                        <div className="space-y-1">
                            <label className="text-xs uppercase tracking-wider text-text-muted font-medium ml-1">Email Address</label>
                            <input
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                className="w-full bg-primary-bg/50 border border-border rounded-lg px-4 py-3 text-text-main focus:outline-none focus:border-accent-gold focus:ring-1 focus:ring-accent-gold transition-all"
                                placeholder="name@company.com"
                                required
                            />
                        </div>

                        <div className="space-y-1">
                            <label className="text-xs uppercase tracking-wider text-text-muted font-medium ml-1">Password</label>
                            <input
                                type="password"
                                name="password"
                                value={formData.password}
                                onChange={handleChange}
                                className="w-full bg-primary-bg/50 border border-border rounded-lg px-4 py-3 text-text-main focus:outline-none focus:border-accent-gold focus:ring-1 focus:ring-accent-gold transition-all"
                                placeholder="Make it strong"
                                required
                                minLength={6}
                            />
                        </div>

                        <div className="pt-2">
                            <label className="text-xs uppercase tracking-wider text-text-muted font-medium ml-1 block mb-2">I am joining as a</label>
                            <div className="grid grid-cols-2 gap-3">
                                <label className="cursor-pointer relative">
                                    <input
                                        type="radio"
                                        name="role"
                                        value="Client"
                                        checked={formData.role === 'Client'}
                                        onChange={handleChange}
                                        className="sr-only peer"
                                    />
                                    <div className="text-center py-3 rounded-lg border border-border bg-primary-bg/30 text-text-muted peer-checked:bg-accent-gold peer-checked:text-primary-bg peer-checked:border-accent-gold peer-checked:font-bold transition-all hover:bg-primary-bg/50">
                                        CLIENT
                                    </div>
                                </label>
                                <label className="cursor-pointer relative">
                                    <input
                                        type="radio"
                                        name="role"
                                        value="Provider"
                                        checked={formData.role === 'Provider'}
                                        onChange={handleChange}
                                        className="sr-only peer"
                                    />
                                    <div className="text-center py-3 rounded-lg border border-border bg-primary-bg/30 text-text-muted peer-checked:bg-accent-gold peer-checked:text-primary-bg peer-checked:border-accent-gold peer-checked:font-bold transition-all hover:bg-primary-bg/50">
                                        PROVIDER
                                    </div>
                                </label>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-gradient-to-r from-accent-gold to-yellow-600 text-primary-bg py-3.5 font-bold uppercase tracking-widest text-xs rounded-lg hover:shadow-lg hover:shadow-accent-gold/20 transition-all duration-300 disabled:opacity-50 mt-4"
                        >
                            {loading ? 'Processing...' : 'Initialize Membership'}
                        </button>
                    </form>

                    <div className="mt-6 flex items-center gap-3">
                        <div className="h-px bg-border flex-1"></div>
                        <span className="text-[10px] text-text-muted uppercase tracking-widest">or continue with</span>
                        <div className="h-px bg-border flex-1"></div>
                    </div>

                    <div className="mt-6 flex justify-center">
                        <GoogleLogin
                            onSuccess={handleGoogleSuccess}
                            onError={() => setError('Google Authentication Failed')}
                            theme="filled_black"
                            shape="pill"
                            width="100%"
                        />
                    </div>

                    <p className="mt-8 text-center text-text-muted text-xs">
                        Already authorized?{' '}
                        <Link to="/login" className="text-accent-gold hover:text-white transition-colors font-medium">
                            Access Terminal
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Register;
