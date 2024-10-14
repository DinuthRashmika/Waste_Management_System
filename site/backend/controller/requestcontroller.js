const Request = require('../model/request');
const User = require('../model/user'); // Import the User model 


exports.getRequestAddressByRequestId = async (req, res) => {
    try {
        const requestId = req.params.requestId; // Get requestId from the URL parameters

        // Find the request by its ID
        const request = await Request.findById(requestId);
        if (!request) {
            return res.status(404).json({ message: 'Request not found' });
        }

        // The address is stored directly in the request model
        const address = request.address;

        res.status(200).json({
            request, // Send the full request object
            address // Send the address directly
        });
    } catch (error) {
        console.error('Error fetching request address:', error);
        res.status(500).json({ message: 'Server error' });
    }
};


exports.completeRequest = async (req, res) => {
    try {
        const requestId = req.params.requestId;

        // Find the request by ID
        const request = await Request.findById(requestId);

        if (!request) {
            return res.status(404).json({ message: 'Request not found' });
        }

        // Update the request status to "Completed"
        request.status = 'Completed';
        await request.save();

        res.status(200).json({ message: 'Request marked as complete' });
    } catch (error) {
        console.error('Error completing request:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.getAllConfirmedRequests = async (req, res) => {
    try {
        // Fetch all requests with status "Confirmed"
        // No need to populate 'addresses' as address is already part of the Request schema
        const requests = await Request.find({ status: 'Confirmed' })
            .populate({
                path: 'user', 
                select: 'name', // Populate only the 'name' field of the user
            });

        // Return the confirmed requests
        res.status(200).json(requests);
    } catch (error) {
        console.error('Error fetching confirmed requests:', error);
        res.status(500).json({ message: 'Server error' });
    }
};


exports.confirmRequest = async (req, res) => {
    try {
        const requestId = req.params.requestId; // Get the request ID from URL params

        // Find the request by ID
        const request = await Request.findById(requestId);

        // If the request doesn't exist, return 404
        if (!request) {
            return res.status(404).json({ message: 'Request not found' });
        }

        // Update the request status to 'Confirmed'
        request.status = 'Confirmed';

        // Save the updated request
        await request.save();

        res.status(200).json({ message: 'Request confirmed successfully', status: request.status });
    } catch (error) {
        console.error('Error confirming request:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Existing createRequest method
exports.createRequest = async (req, res) => {
    try {
        const userId = req.userId; // Ensure req.userId is correctly populated by the JWT middleware
        const { address } = req.body; // Extract address from the request body

        if (!userId) {
            return res.status(400).json({ message: 'User ID is missing' });
        }

        if (!address) {
            return res.status(400).json({ message: 'Address is required.' });
        }

        // Check if the user already has a pending or confirmed request
        const existingRequest = await Request.findOne({ 
            user: userId, 
            status: { $in: ['Pending', 'Confirmed'] }, 
            completed: false 
        });

        if (existingRequest) {
            return res.status(400).json({ message: 'You already have a pending or confirmed request. Please wait for it to be completed before making another request.' });
        }

        // Create a new request with the user ID and address
        const newRequest = new Request({ user: userId, address });
        await newRequest.save();
        
        res.status(201).json({ message: 'Request created successfully' });
    } catch (error) {
        console.error('Error creating request:', error); // Log the actual error
        res.status(500).json({ message: 'Server error' });
    }
};

exports.deleteRequest = async (req, res) => {
    try {
        const userId = req.userId; // Get userId from JWT middleware
        const requestId = req.params.requestId; // Get request ID from the route

        // Find the request by ID and ensure it belongs to the logged-in user
        const request = await Request.findOne({ _id: requestId, user: userId });

        if (!request) {
            return res.status(404).json({ message: 'Request not found or unauthorized to delete' });
        }

        // Use deleteOne instead of remove
        await request.deleteOne(); // Delete the request
        res.status(200).json({ message: 'Request deleted successfully' });
    } catch (error) {
        console.error('Error deleting request:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Get status of the user's latest request
exports.getRequestStatus = async (req, res) => {
    try {
        const userId = req.userId; // Get userId from JWT middleware
        const request = await Request.findOne({ user: userId }).sort({ createdAt: -1 });
        if (!request) {
            return res.status(404).json({ message: 'No Request' }); // Return 404 if no request
        }
        res.status(200).json({ status: request.status });
    } catch (error) {
        console.error('Error fetching request status:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Get all pending requests for admin
exports.getAllRequests = async (req, res) => {
    try {
        const requests = await Request.find({ status: 'Pending' }).populate('user');
        res.status(200).json(requests);
    } catch (error) {
        console.error('Error fetching requests:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Update request status to confirmed
exports.confirmRequest = async (req, res) => {
    try {
        const requestId = req.params.requestId;
        const request = await Request.findById(requestId);

        if (!request) {
            return res.status(404).json({ message: 'Request not found' });
        }

        request.status = 'Confirmed';
        await request.save();
        res.status(200).json({ message: 'Request confirmed' });
    } catch (error) {
        console.error('Error confirming request:', error);
        res.status(500).json({ message: 'Server error' });
    }
};