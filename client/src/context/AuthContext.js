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
            // Set user based on the token
            setUser({ token });
        }
    }, []);

    const login = async (email, password) => {
        try {
            const response = await axios.post('http://localhost:5001/login', { email, password });
            localStorage.setItem('token', response.data.token); // Store JWT in localStorage
            setUser({ token: response.data.token });
        } catch (err) {
            console.error('Login failed', err);
        }
    };

    const register = async (first_name, last_name, email, password) => {
        try {
            const response = await axios.post('http://localhost:5001/register', { first_name, last_name, email, password });
            localStorage.setItem('token', response.data.token); // Store JWT in localStorage after registration
            setUser({ token: response.data.token }); // Set user state with the token
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
