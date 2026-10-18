import React, { createContext, useState, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext();
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001';
const api = axios.create({ baseURL: API_URL, withCredentials: true });

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);

    useEffect(() => {
        let active = true;
        api.get('/auth/me')
            .then(({ data }) => { if (active) setUser(data.user); })
            .catch(() => { if (active) setUser(null); });
        return () => { active = false; };
    }, []);

    const login = async (email, password) => {
        try {
            const { data } = await api.post('/login', { email, password });
            setUser(data.user);
        } catch (err) {
            console.error('Login failed', err);
            throw err;
        }
    };

    const register = async (first_name, last_name, email, password) => {
        try {
            const { data } = await api.post('/register', { first_name, last_name, email, password });
            setUser(data.user);
        } catch (err) {
            console.error('Registration failed', err);
        }
    };

    const logout = async () => {
        try {
            await api.post('/logout');
        } finally {
            setUser(null);
        }
    };

    return (
        <AuthContext.Provider value={{ user, login, register, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export default AuthContext;
