const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: false, // Email is optional
        unique: true, // Email must be unique if provided
    },
    password: {
        type: String,
        required: true,
    },
    role: {
        type: String,
        enum: ['admin', 'user', 'collector'],
        default: 'user', // Corrected the typo from 'defaullt' to 'default'
        required: false,
    },
    addresses: {
        type: [String], // Array to store multiple addresses as strings
        default: [], // Default to an empty array if no address is provided
    },
});

 

module.exports = mongoose.model('User', UserSchema);