require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const User = require('./models/User');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const { findShows } = require('./services/tmdb');

const app = express();
const PORT = Number(process.env.PORT) || 5001;
const JWT_SECRET = process.env.JWT_SECRET;
const FRONTEND_ORIGIN = process.env.FRONTEND_ORIGIN || 'http://localhost:3000';
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/StreamFlare';
const isProduction = process.env.NODE_ENV === 'production';
const COOKIE_NAME = isProduction ? '__Host-streamflare_session' : 'streamflare_session';
const cookieOptions = {
    httpOnly: true,
    secure: isProduction,
    sameSite: 'lax',
    path: '/',
};

app.disable('x-powered-by');
app.use((req, res, next) => {
    res.set({
        'X-Content-Type-Options': 'nosniff',
        'X-Frame-Options': 'DENY',
        'Referrer-Policy': 'no-referrer',
        'Content-Security-Policy': "default-src 'none'; frame-ancestors 'none'",
    });
    next();
});
app.use(express.json({ limit: '10kb' }));
app.use(cors({
    origin: FRONTEND_ORIGIN,
    methods: ['GET', 'POST'],
    credentials: true,
}));

// Small in-process limit for auth endpoints; use a shared store when running
// multiple server instances.
const attempts = new Map();
const AUTH_WINDOW_MS = 15 * 60 * 1000;
const AUTH_MAX_ATTEMPTS = 10;
function authRateLimit(req, res, next) {
    if (!isProduction && process.env.DISABLE_AUTH_RATE_LIMIT === 'true') return next();

    const now = Date.now();
    const key = req.ip;
    let entry = attempts.get(key);
    if (!entry || entry.resetAt <= now) {
        entry = { count: 0, resetAt: now + AUTH_WINDOW_MS };
        attempts.set(key, entry);
    }
    entry.count += 1;
    if (attempts.size > 10000) {
        for (const [ip, item] of attempts) if (item.resetAt <= now) attempts.delete(ip);
    }
    if (entry.count > AUTH_MAX_ATTEMPTS) {
        res.set('Retry-After', String(Math.ceil((entry.resetAt - now) / 1000)));
        return res.status(429).json({ message: 'Too many attempts. Try again later.' });
    }
    next();
}

function rejectBadOrigin(req, res, next) {
    const origin = req.get('Origin');
    if (origin && origin !== FRONTEND_ORIGIN) {
        return res.status(403).json({ message: 'Request origin is not allowed' });
    }
    next();
}

function setSessionCookie(res, userId) {
    const token = jwt.sign({ userId }, JWT_SECRET, { expiresIn: '1h', algorithm: 'HS256' });
    res.cookie(COOKIE_NAME, token, { ...cookieOptions, maxAge: 60 * 60 * 1000 });
}

function readCookie(req, name) {
    const cookies = (req.headers.cookie || '').split(';');
    const item = cookies.find((part) => part.trim().startsWith(`${name}=`));
    return item ? decodeURIComponent(item.trim().slice(name.length + 1)) : null;
}

async function findSessionUser(req) {
    const token = readCookie(req, COOKIE_NAME);
    if (!token) return null;
    try {
        const payload = jwt.verify(token, JWT_SECRET, { algorithms: ['HS256'] });
        return await User.findById(payload.userId).select('_id first_name last_name email');
    } catch (_error) {
        return null;
    }
}

app.post('/register', rejectBadOrigin, authRateLimit, async (req, res) => {
    if (!JWT_SECRET || JWT_SECRET.length < 32) {
        return res.status(503).json({ message: 'Accounts are not configured on this server yet.' });
    }
    const { first_name, last_name, email, password } = req.body || {};
    if (![first_name, last_name, email, password].every((value) => typeof value === 'string') ||
        first_name.trim().length < 1 || first_name.length > 100 ||
        last_name.trim().length < 1 || last_name.length > 100 ||
        email.length > 254 || password.length < 8 || password.length > 72) {
        return res.status(400).json({ message: 'Please provide valid registration details' });
    }

    try {
        const normalizedEmail = email.trim().toLowerCase();
        const userExists = await User.findOne({ email: normalizedEmail });
        if (userExists) return res.status(409).json({ message: 'An account with this email already exists.' });

        const user = await User.create({
            first_name: first_name.trim(),
            last_name: last_name.trim(),
            email: normalizedEmail,
            password,
        });
        setSessionCookie(res, user._id.toString());
        res.status(201).json({ user: { id: user._id, first_name: user.first_name, last_name: user.last_name, email: user.email } });
    } catch (err) {
        if (err && err.code === 11000) return res.status(409).json({ message: 'An account with this email already exists.' });
        if (err && err.name === 'ValidationError') return res.status(400).json({ message: 'Please provide valid registration details' });
        console.error('Registration failed:', err);
        res.status(500).json({ message: 'Registration failed' });
    }
});

app.post('/login', rejectBadOrigin, authRateLimit, async (req, res) => {
    if (!JWT_SECRET || JWT_SECRET.length < 32) {
        return res.status(503).json({ message: 'Accounts are not configured on this server yet.' });
    }
    const { email, password } = req.body || {};
    if (typeof email !== 'string' || typeof password !== 'string' || email.length > 254 || password.length > 72) {
        return res.status(400).json({ message: 'Invalid email or password' });
    }
    try {
        const user = await User.findOne({ email: email.trim().toLowerCase() });
        const passwordMatches = user ? await user.matchPassword(password) : false;
        if (!passwordMatches) return res.status(401).json({ message: 'Invalid email or password' });

        setSessionCookie(res, user._id.toString());
        res.json({ user: { id: user._id, first_name: user.first_name, last_name: user.last_name, email: user.email } });
    } catch (err) {
        console.error('Login failed:', err);
        res.status(500).json({ message: 'Login failed' });
    }
});

app.get('/api/shows', async (req, res) => {
    try {
        const data = await findShows({ region: req.query.region, query: req.query.q });
        res.json(data);
    } catch (err) {
        if (err.status === 400 || err.status === 503 || err.status === 502) {
            return res.status(err.status).json({ message: err.message });
        }
        console.error('Show lookup failed:', err);
        res.status(503).json({ message: 'Could not load streaming data right now. Please try again.' });
    }
});

app.get('/auth/me', async (req, res) => {
    const user = await findSessionUser(req);
    if (!user) return res.status(401).json({ message: 'Not authenticated' });
    res.json({ user: { id: user._id, first_name: user.first_name, last_name: user.last_name, email: user.email } });
});

app.post('/logout', rejectBadOrigin, (req, res) => {
    res.clearCookie(COOKIE_NAME, cookieOptions);
    res.status(204).end();
});

if (require.main === module) {
    mongoose.connect(MONGODB_URI)
        .then(() => console.log('Connected to MongoDB'))
        .catch((err) => {
            console.error('MongoDB connection failed:', err.message);
            console.error('Show discovery can continue, but account features need MongoDB.');
        });

    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
}

module.exports = app;
