const mongoose = require('mongoose');

const AddressSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    address: {
        type: String,
        required: true,
    },
    monthlyPayment: {
        type: Number,
        default: 3190, // Default monthly payment for garbage services
    },
    garbageWeight: {
        type: Number, // Non-recycled garbage weight in kilograms
        default: 0,
    },
    recycleGarbageWeight: {
        type: Number, // Recycled garbage weight in kilograms
        default: 0,
    },
    refundAmount: {
        type: Number, // Amount refunded from recycling (319 per kg)
        default: 0,
    },
});

AddressSchema.methods.calculateRefund = function() {
    // 319 is the refund per kg of recycled garbage
    this.refundAmount = this.recycleGarbageWeight * 319;
    this.monthlyPayment -= this.refundAmount;
};

module.exports = mongoose.model('Address', AddressSchema)