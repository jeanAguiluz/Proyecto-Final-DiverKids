// src/context/useAuth.js
import { useContext, useState } from 'react';
import axios from 'axios';
import { AuthContext } from './AuthContext';
import { API_URL } from '../config/api';

export const useProvideAuth = () => {
    const [user, setUser] = useState(() => {
        const storedUser = localStorage.getItem('user');
        return storedUser ? JSON.parse(storedUser) : null;
    });

    const [token, setToken] = useState(() => {
        return localStorage.getItem('token') || null;
    });

    const [loading, setLoading] = useState(false);

    const login = async (email, password) => {
        setLoading(true);
        try {
            const response = await axios.post(`${API_URL}/login`, { email, password });
            const { token, user } = response.data;

            localStorage.setItem('token', token);
            localStorage.setItem('user', JSON.stringify(user));

            setToken(token);
            setUser(user);

            setLoading(false);
            return { success: true };
        } catch (error) {
            setLoading(false);
            console.error('Login error:', error);
            return {
                success: false,
                message: error.response?.data?.msg || 'Error al iniciar sesión'
            };
        }
    };

    const signup = async (name, email, password, role = 'parent') => {
        setLoading(true);
        try {
            const response = await axios.post(`${API_URL}/signup`, { name, email, password, role });
            setLoading(false);
            return { success: true, message: response.data.msg };
        } catch (error) {
            setLoading(false);
            console.error('Signup error:', error);
            return {
                success: false,
                message: error.response?.data?.msg || 'Error al registrarse'
            };
        }
    };

    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setToken(null);
        setUser(null);
    };

    const isAdmin = () => user?.role === 'admin';

    return { user, token, loading, login, signup, logout, isAdmin };
};

export const useAuth = () => {
    const context = useContext(AuthContext);

    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }

    return context;
};
