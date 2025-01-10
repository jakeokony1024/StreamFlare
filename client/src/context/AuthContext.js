// frontend/src/context/AuthContext.js
import React, { createContext, useState, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);

    useEffect(() => {
        // Check localStorage for a stored JWT token
        const token = localStorage.getItem('token');
        if (token) {
            // You can fetch user info here if needed
            setUser({ token });
        }
    }, []);

    const login = async (email, password) => {
        try {
            const response = await axios.post('http://localhost:3000/login', { email, password });
            localStorage.setItem('token', response.data.token); // Store JWT in localStorage
            setUser({ token: response.data.token });
        } catch (err) {
            console.error('Login failed', err);
        }
    };

    const register = async (first_name, last_name, email, password) => {
        try {
            await axios.post('http://localhost:3000/register', { first_name, last_name, email, password });
            await login(email, password); // Auto-login after registration
        } catch (err) {
            console.error('Registration failed', err);
        }
    };

    const logout = () => {
        localStorage.removeItem('token');
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, login, register, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export default AuthContext;
