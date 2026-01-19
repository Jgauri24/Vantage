import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

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
    const { register } = useAuth();
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

    return (
        <div className="min-h-screen flex items-center justify-center px-4 bg-primary-bg py-12">
            <div className="w-full max-w-[450px]">
                <div className="text-center mb-12">
                    <h1 className="font-serif text-5xl text-black mb-2 tracking-tighter">VANTAGE</h1>
                    <div className="h-1 w-12 bg-accent-red mx-auto"></div>
                </div>

                <div className="bg-white p-8">
                    <h2 className="font-sans text-xl font-semibold text-black mb-8 uppercase tracking-widest text-center">Member Registration</h2>

                    {error && (
                        <div className="bg-red-50 text-accent-red px-4 py-3 mb-6 text-sm border-l-2 border-accent-red">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="relative group">
                            <input
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                className="w-full bg-transparent border-b border-gray-300 py-3 text-black focus:outline-none focus:border-accent-red transition-colors placeholder-transparent peer"
                                placeholder="Full Name"
                                required
                            />
                            <label className="absolute left-0 top-3 text-text-muted text-sm transition-all peer-focus:-top-3 peer-focus:text-xs peer-focus:text-accent-red peer-not-placeholder-shown:-top-3 peer-not-placeholder-shown:text-xs peer-not-placeholder-shown:text-text-muted cursor-text">
                                Full Name
                            </label>
                        </div>

                        <div className="relative group">
                            <input
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
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
                                name="password"
                                value={formData.password}
                                onChange={handleChange}
                                className="w-full bg-transparent border-b border-gray-300 py-3 text-black focus:outline-none focus:border-accent-red transition-colors placeholder-transparent peer"
                                placeholder="Password"
                                required
                                minLength={6}
                            />
                            <label className="absolute left-0 top-3 text-text-muted text-sm transition-all peer-focus:-top-3 peer-focus:text-xs peer-focus:text-accent-red peer-not-placeholder-shown:-top-3 peer-not-placeholder-shown:text-xs peer-not-placeholder-shown:text-text-muted cursor-text">
                                Password
                            </label>
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs uppercase tracking-wide text-text-muted block">Account Type</label>
                            <div className="flex gap-4">
                                <label className="flex-1 cursor-pointer">
                                    <input
                                        type="radio"
                                        name="role"
                                        value="Client"
                                        checked={formData.role === 'Client'}
                                        onChange={handleChange}
                                        className="sr-only"
                                    />
                                    <div className={`text-center py-3 border transition-colors ${formData.role === 'Client' ? 'border-black bg-black text-white' : 'border-gray-200 text-text-muted hover:border-gray-400'}`}>
                                        CLIENT
                                    </div>
                                </label>
                                <label className="flex-1 cursor-pointer">
                                    <input
                                        type="radio"
                                        name="role"
                                        value="Provider"
                                        checked={formData.role === 'Provider'}
                                        onChange={handleChange}
                                        className="sr-only"
                                    />
                                    <div className={`text-center py-3 border transition-colors ${formData.role === 'Provider' ? 'border-black bg-black text-white' : 'border-gray-200 text-text-muted hover:border-gray-400'}`}>
                                        PROVIDER
                                    </div>
                                </label>
                            </div>
                        </div>

                        <div className="relative group">
                            <input
                                type="text"
                                name="company"
                                value={formData.company}
                                onChange={handleChange}
                                className="w-full bg-transparent border-b border-gray-300 py-3 text-black focus:outline-none focus:border-accent-red transition-colors placeholder-transparent peer"
                                placeholder="Company"
                            />
                            <label className="absolute left-0 top-3 text-text-muted text-sm transition-all peer-focus:-top-3 peer-focus:text-xs peer-focus:text-accent-red peer-not-placeholder-shown:-top-3 peer-not-placeholder-shown:text-xs peer-not-placeholder-shown:text-text-muted cursor-text">
                                Company (Optional)
                            </label>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-black text-white py-4 font-medium uppercase tracking-widest text-xs hover:bg-accent-red transition-all duration-300 disabled:opacity-50 mt-8"
                        >
                            {loading ? 'Creating Profile...' : 'Create Profile'}
                        </button>
                    </form>

                    <p className="mt-10 text-center text-text-muted text-xs uppercase tracking-wide">
                        Already a member?{' '}
                        <Link to="/login" className="text-black hover:text-accent-red font-bold transition-colors">
                            Access Account
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Register;
