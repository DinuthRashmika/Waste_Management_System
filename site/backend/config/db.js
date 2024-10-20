const mongoose = require('mongoose');

let isConnected = false; // Track the connection status

// Function to connect to MongoDB (Singleton-like)
const connectDB = async () => {
    if (isConnected) {
        console.log('Already connected to MongoDB');
        return;
    }
    try {
        const conn = await mongoose.connect(process.env.MONGODB_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        isConnected = true; // Set to true after successful connection
        console.log(`MongoDB connected: ${conn.connection.host}`);
    } catch (error) {
        console.error('Database connection error:', error.message);
        process.exit(1); // Exit process with failure
    }
};

module.exports = connectDB;
