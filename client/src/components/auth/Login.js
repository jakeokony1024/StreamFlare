// frontend/src/components/Login.js
import React, { useState, useContext } from 'react';
import { Link } from 'react-router-dom';
import AuthContext from '../../context/AuthContext';
import '../../App.css';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const { login } = useContext(AuthContext);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        try {
            await login(email, password);
        } catch (_err) {
            setError('Unable to log in with that email and password.');
        }
    };

    return (
        <main className="login-page">
            <div className="login-glow login-glow-one" aria-hidden="true" />
            <div className="login-glow login-glow-two" aria-hidden="true" />
            <section className="login-card" aria-labelledby="login-title">
                <div className="login-mark" aria-hidden="true">S</div>
                <p className="login-eyebrow">STREAMFLARE</p>
                <h1 id="login-title">Welcome back</h1>
                <p className="login-intro">Sign in to continue to your account.</p>
                <form className="login-form" onSubmit={handleSubmit}>
                    <label htmlFor="login-email">Email</label>
                    <input
                        id="login-email"
                        type="email"
                        autoComplete="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="you@example.com"
                        required
                    />
                    <label htmlFor="login-password">Password</label>
                    <div className="password-input-wrap">
                        <input
                            id="login-password"
                            type={showPassword ? 'text' : 'password'}
                            autoComplete="current-password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Enter your password"
                            required
                        />
                        <button
                            className="password-visibility-toggle"
                            type="button"
                            aria-label={showPassword ? 'Hide password' : 'Show password'}
                            aria-pressed={showPassword}
                            onClick={() => setShowPassword((visible) => !visible)}
                        >
                            {showPassword ? 'Hide' : 'Show'}
                        </button>
                    </div>
                    {error && <p className="login-error" role="alert">{error}</p>}
                    <button type="submit">Sign in <span aria-hidden="true">→</span></button>
                </form>
                <p className="login-signup">New to StreamFlare? <Link to="/register">Create an account</Link></p>
            </section>
        </main>
    );
};

export default Login;
