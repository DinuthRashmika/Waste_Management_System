const mongoose = require('mongoose');

const RequestSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    address: {
        type: String,
        required: true // Assuming address is required for the request
    },
   
    status: {
        type: String,
        enum: ['Pending', 'Confirmed' , 'Completed'],
        default: 'Pending',
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

module.exports = mongoose.model('Request', RequestSchema);