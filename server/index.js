// backend/index.js
require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const User = require('./models/User'); // Import User model
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const app = express();
const JWT_SECRET = process.env.JWT_SECRET;
app.use(express.json());
app.use(cors({
    origin: 'http://localhost:3000', // Your frontend URL
    methods: ['GET', 'POST'],
    credentials: true,
}));

// MongoDB connection
mongoose.connect('mongodb://127.0.0.1:27017/StreamFlare', { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('Connected to MongoDB'))
    .catch((err) => console.log('MongoDB connection error:', err));

// User registration route
app.post('/register', async (req, res) => {
    const { first_name, last_name, email, password } = req.body;
    try {
        const userExists = await User.findOne({ email });
        const createdAt = new Date();
        if (userExists) return res.status(400).json({ message: 'User already exists' });

        const newUser = new User({ first_name, last_name, email, password, createdAt });
        await newUser.save();

        // Generate JWT token after successful registration
        const token = jwt.sign({ userId: newUser._id }, JWT_SECRET, { expiresIn: '1h' });

        res.status(201).json({ token }); // Return token in response
    } catch (err) {
        res.status(500).json({ message: 'Error registering user', error: err });
    }
});

// User login route
app.post('/login', async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await User.findOne({ email });
        if (!user) return res.status(404).json({ message: 'User not found' });

        const isPasswordValid = await user.matchPassword(password);
        if (!isPasswordValid) return res.status(400).json({ message: 'Invalid credentials' });

        const token = jwt.sign({ userId: user._id }, 'your_jwt_secret', { expiresIn: '1h' });
        res.json({ token });
    } catch (err) {
        res.status(500).json({ message: 'Login error', error: err });
    }
});

// Server listening
app.listen(5001, () => {
    console.log("Server running on port 5001");
});
