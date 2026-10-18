import React, { useState, useContext } from 'react';
import { Link } from 'react-router-dom';
import AuthContext from '../../context/AuthContext';
import '../../App.css';

const Register = () => {
    const [first_name, setFirstName] = useState('');
    const [last_name, setLastName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const { register } = useContext(AuthContext);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        try {
            await register(first_name, last_name, email, password);
        } catch (_err) {
            setError('Unable to create an account with those details.');
        }
    };

    return (
        <main className="login-page">
            <div className="login-glow login-glow-one" aria-hidden="true" />
            <div className="login-glow login-glow-two" aria-hidden="true" />
            <section className="login-card register-card" aria-labelledby="register-title">
                <div className="login-mark" aria-hidden="true">S</div>
                <p className="login-eyebrow">STREAMFLARE</p>
                <h1 id="register-title">Create your account</h1>
                <p className="login-intro">A few details and you’re ready to get started.</p>
                <form className="login-form" onSubmit={handleSubmit}>
                    <label htmlFor="register-first-name">First name</label>
                    <input
                        id="register-first-name"
                        type="text"
                        autoComplete="given-name"
                        value={first_name}
                        onChange={(e) => setFirstName(e.target.value)}
                        placeholder="First name"
                        maxLength={100}
                        required
                    />
                    <label htmlFor="register-last-name">Last name</label>
                    <input
                        id="register-last-name"
                        type="text"
                        autoComplete="family-name"
                        value={last_name}
                        onChange={(e) => setLastName(e.target.value)}
                        placeholder="Last name"
                        maxLength={100}
                        required
                    />
                    <label htmlFor="register-email">Email</label>
                    <input
                        id="register-email"
                        type="email"
                        autoComplete="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="you@example.com"
                        maxLength={254}
                        required
                    />
                    <label htmlFor="register-password">Password</label>
                    <input
                        id="register-password"
                        type="password"
                        autoComplete="new-password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="At least 8 characters"
                        minLength={8}
                        maxLength={72}
                        required
                    />
                    {error && <p className="login-error" role="alert">{error}</p>}
                    <button type="submit">Create account <span aria-hidden="true">→</span></button>
                </form>
                <p className="login-signup">Already have an account? <Link to="/login">Sign in</Link></p>
            </section>
        </main>
    );
};

export default Register;
