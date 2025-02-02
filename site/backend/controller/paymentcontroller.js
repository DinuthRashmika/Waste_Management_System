const Address = require('../model/adress');

// Command for handling payments
class PaymentCommand {
    constructor(address) {
        this.address = address;
    }

    execute() {
        this.address.monthlyPayment = 0; // Reset monthly payment to 0
        return this.address.save(); // Save the updated address
    }
}

// Handle Payment and Reset Monthly Payment
exports.handlePayment = async (req, res) => {
    const { userId, addressId } = req.body; // Now receiving both userId and addressId

    try {
        // Find the specific address by both userId and addressId
        const address = await Address.findOne({ user: userId, _id: addressId });

        if (!address) {
            return res.status(404).json({ message: 'Address not found' });
        }

        // Create and execute the payment command
        const paymentCommand = new PaymentCommand(address);
        await paymentCommand.execute();

        res.status(200).json({ message: 'Payment successful, monthly payment reset to 0' });
    } catch (error) {
        console.error('Error handling payment:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Schedule task to reset monthly payment on the 1st of every month
const cron = require('node-cron');
cron.schedule('0 0 1 * *', async () => {
    try {
        const addresses = await Address.find();

        // Reset the monthly payment for all addresses to the default value
        addresses.forEach(async (address) => {
            address.monthlyPayment = 3190; // Default monthly fee
            await address.save();
        });

        console.log('Monthly payments reset for all users');
    } catch (error) {
        console.error('Error resetting monthly payments:', error);
    }
});
