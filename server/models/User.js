const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const validator = require('validator');
const {Schema} = require("mongoose");

const userSchema = new Schema({
    first_name: {
        type: String,
        required: true,
    },
    last_name: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
        validate(value) {
            if (!validator.isEmail(value)) {
                throw new Error('Email is invalid');
            }
        },
    },
    password: {
        type: String,
        required: true,
        minlength: 8,
    },
    created_at: {
        type: Date,
        default: Date.now,
    }
});

// Hash password before saving to DB
userSchema.pre('save', async function(next) {
    if (this.isModified('password')) {
        this.password = await bcrypt.hash(this.password, 8); // Hashing password
    }
    next();
});

// Compare password for login
userSchema.methods.matchPassword = async function(enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.model('User', userSchema);

module.exports = User;