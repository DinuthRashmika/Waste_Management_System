// server.js
const express = require('express');
const connectDB = require('./config/db');
const dotenv = require('dotenv');
const cors = require('cors');
const authRoutes = require('./route/auth'); // Correct path
const addres = require('./route/addres')

// Load environment variables
dotenv.config();
const mongoose = require('mongoose');

// Function to connect to MongoDB
// const connectDB = async () => {
//     try {
//         const conn = await mongoose.connect(process.env.MONGO_URI, {
//             useNewUrlParser: true,
//             useUnifiedTopology: true,
//         });
//         console.log(`MongoDB connected: ${conn.connection.host}`);
//     } catch (error) {
//         console.error('Database connection error:', error.message);
//         process.exit(1); // Exit process with failure
//     }
// };

module.exports = connectDB;

const app = express();
const PORT = process.env.PORT || 4000;

// Connect to MongoDB
connectDB();

// Middleware
app.use(express.json());
app.use(cors());

// API Routes
app.use('/api', authRoutes);
app.use('/api', addres)
// Start the server
app.listen(PORT, () => {
    console.log(`Server running on  ${PORT}`);
});
