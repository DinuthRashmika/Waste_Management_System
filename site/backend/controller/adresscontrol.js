const Address = require('../model/adress');
const User = require('../model/user');

// Factory function to create a new Address instance
const addressFactory = (userId, address, monthlyPayment) => {
    return new Address({
        user: userId,
        address: address,
        monthlyPayment: monthlyPayment || 3190, // Default to 3190 if not provided
    });
};

// Add a new tenant address
exports.addNewAddress = async (req, res) => {
    try {
        const userId = req.userId; // Extract userId from the JWT middleware
        const { address, monthlyPayment } = req.body;

        if (!address) {
            return res.status(400).json({ message: 'Address is required.' });
        }

        // Use the factory function to create a new address
        const newAddress = addressFactory(userId, address, monthlyPayment);

        await newAddress.save();

        res.status(201).json({ message: 'Address added successfully', address: newAddress });
    } catch (error) {
        console.error('Error adding tenant:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};



exports.updateAddress = async (req, res) => {
    const { userId, garbageWeight, recycleWeight } = req.body;

    try {
        // Find the address by userId
        const address = await Address.findOne({ user: userId });

        if (!address) {
            return res.status(404).json({ message: 'Address not found' });
        }

        // Refund calculation: 319 per unit of recyclable garbage
        const refundAmount = recycleWeight * 319;

        // Update the monthly payment by subtracting the refund amount
        const updatedMonthlyPayment = address.monthlyPayment - refundAmount;

        // Update the address model with new monthly payment and weights
        address.monthlyPayment = updatedMonthlyPayment;
        address.garbageWeight = garbageWeight;
        address.recycleWeight = recycleWeight;

        // Save the updated address
        await address.save();

        res.status(200).json({ message: 'Address updated successfully' });
    } catch (error) {
        console.error('Error updating address:', error);
        res.status(500).json({ message: 'Server error' });
    }
};
// Retrieve all addresses for the authenticated user
exports.getUserAddresses = async (req, res) => {
    try {
        const userId = req.userId; // Get userId from the JWT middleware

        // Find all addresses associated with the authenticated user
        const addresses = await Address.find({ user: userId });

        if (addresses.length === 0) {
            return res.status(404).json({ message: 'No addresses found for this user.' });
        }

        res.status(200).json({ addresses }); // Return all addresses
    } catch (error) {
        console.error('Error retrieving addresses:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};
exports.getAddressesByUserId = async (req, res) => {
    try {
        const { userId } = req.params; // Extract userId from the request params

        // Find all addresses associated with the provided userId
        const addresses = await Address.find({ user: userId });

        // Check if any addresses were found
        if (!addresses || addresses.length === 0) {
            return res.status(404).json({ message: 'No addresses found for this user.' });
        }

        // Return the addresses in the response
        res.status(200).json({ addresses });
    } catch (error) {
        console.error('Error fetching addresses:', error);
        res.status(500).json({ message: 'Error fetching addresses', error });
    }
};
 
// Get total garbage collections (count of addresses)
exports.getTotalGarbageCollections = async (req, res) => {
    try {
        // Count all documents in the Address collection
        const totalCollections = await Address.countDocuments();
        res.status(200).json({ totalCollections });
    } catch (error) {
        console.error('Error fetching garbage collections:', error);
        res.status(500).json({ message: 'Error fetching garbage collections', error });
    }
};

// Get total number of users
exports.getTotalUsers = async (req, res) => {
    try {
        const totalUsers = await User.countDocuments(); // Count all users in the User collection
        res.status(200).json({ totalUsers });
    } catch (error) {
        console.error('Error fetching total users:', error);
        res.status(500).json({ message: 'Error fetching total users', error });
    }
};

// Get address details by user ID
exports.getAddressDetails = async (req, res) => {
    try {
        const userId = req.userId; // Assuming JWT middleware provides userId

        // Fetch all addresses for the authenticated user
        const addresses = await Address.find({ user: userId });

        if (!addresses || addresses.length === 0) {
            return res.status(404).json({ message: 'No addresses found for this user' });
        }

        res.status(200).json({
            addresses: addresses.map(address => ({
                addressId: address._id,
                address: address.address,
                monthlyPayment: address.monthlyPayment,
            })),
        });
    } catch (error) {
        console.error('Error retrieving address details:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Delete a specific address by ID
exports.deleteAddress = async (req, res) => {
    try {
        const addressId = req.params.addressId;

        // Find and delete the address
        const deletedAddress = await Address.findByIdAndDelete(addressId);

        if (!deletedAddress) {
            return res.status(404).json({ message: 'Address not found' });
        }

        res.status(200).json({ message: 'Address deleted successfully' });
    } catch (error) {
        console.error('Error deleting address:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};