const User = require('../model/user');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Signup a new user
exports.signup = async (req, res) => {
    try {
        const { name, password, email, role } = req.body;

        // Check for required fields
        if (!name || !password) {
            return res.status(400).json({ message: 'Name and password are required.' });
        }

        // Check if a user with the given name or email exists
        const existingUser = await User.findOne({ $or: [{ name }, { email }] });
        if (existingUser) {
            return res.status(400).json({ message: 'User with this name or email already exists' });
        }

        // Hash the password and create the user
        const hashedPassword = await bcrypt.hash(password, 10);
        const user = new User({
            name,
            password: hashedPassword,
            email,
            role: role || 'user',
        });

        await user.save();

        // Generate JWT
        const token = jwt.sign(
            { id: user._id, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: '1h' }
        );

        // Send response with the token and user info
        res.status(201).json({
            token,
            user: { id: user._id, name: user.name, role: user.role }
        });
    } catch (error) {
        console.error('Error during user signup:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Login a user
exports.login = async (req, res) => {
    try {
        const { name, password } = req.body;

        // Validate the presence of name and password
        if (!name || !password) {
            return res.status(400).json({ message: 'Name and password are required.' });
        }

        // Find the user by name
        const user = await User.findOne({ name });
        if (!user) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        // Compare provided password with stored hashed password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        // Generate JWT
        const token = jwt.sign(
            { id: user._id, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: '1h' }
        );

        // Send response with the token and user details
        res.json({
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
            },
        });
    } catch (error) {
        console.error('Error during login:', error);
        res.status(500).json({ message: 'Server error' });
    }
};



// Get user details by ID
exports.getUserDetails = async (req, res) => {
    try {
        const userId = req.params.id;

        // Fetch user details by ID without the password field
        const user = await User.findById(userId).select('-password').populate('addresses');
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.status(200).json(user);
    } catch (error) {
        console.error('Error fetching user details:', error);
        res.status(500).json({ message: 'Server error' });
    }
};


 

// Add a new collector
exports.addCollector = async (req, res) => {
    const { name, email, password } = req.body;

    // Check if all required fields are provided
    if (!name || !password) {
        return res.status(400).json({ message: 'Name and password are required.' });
    }

    try {
        // Check if a user with the given email already exists
        if (email) {
            const existingUser = await User.findOne({ email });
            if (existingUser) {
                return res.status(400).json({ message: 'User with this email already exists.' });
            }
        }

        // Hash the password before saving
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create a new user with the role of 'collector'
        const newCollector = new User({
            name,
            email,
            password: hashedPassword,
            role: 'collector', // Assign the role as 'collector'
        });

        // Save the new collector to the database
        await newCollector.save();

        // Respond with a success message
        res.status(201).json({ message: 'Collector added successfully!', collector: newCollector });
    } catch (error) {
        console.error('Error adding collector:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};





















 

// Get all users with the role 'collector'
exports.getAllCollectors = async (req, res) => {
    try {
        // Find all users where role is 'collector'
        const collectors = await User.find({ role: 'collector' }, 'name email addresses'); // Select only name, email, and addresses

        // Check if any collectors are found
        if (collectors.length === 0) {
            return res.status(404).json({ message: 'No collectors found.' });
        }

        // Return the list of collectors
        res.status(200).json({ collectors });
    } catch (error) {
        console.error('Error fetching collectors:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};
















//Fetch all users
exports.getAllUsers = async (req, res) => {
    try {
        const users = await User.find({}, 'name _id'); // Fetch only the name and _id fields
        res.status(200).json({ users });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching users', error });
    }
};





 