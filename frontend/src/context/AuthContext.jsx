import { createContext, useContext, useState, useEffect } from 'react';
import api from '../utils/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const token = localStorage.getItem('vantage_token');
        const userData = localStorage.getItem('vantage_user');
        if (token && userData) {
            setUser(JSON.parse(userData));
        }
        setLoading(false);
    }, []);

    const login = async (email, password) => {
        const response = await api.post('/auth/login', { email, password });
        localStorage.setItem('vantage_token', response.data.token);
        localStorage.setItem('vantage_user', JSON.stringify(response.data.user));
        setUser(response.data.user);
        return response.data;
    };

    const register = async (userData) => {
        const response = await api.post('/auth/register', userData);
        localStorage.setItem('vantage_token', response.data.token);
        localStorage.setItem('vantage_user', JSON.stringify(response.data.user));
        setUser(response.data.user);
        return response.data;
    };

    const logout = () => {
        localStorage.removeItem('vantage_token');
        localStorage.removeItem('vantage_user');
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, loading, login, register, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within AuthProvider');
    }
    return context;
};
