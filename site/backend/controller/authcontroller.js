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