const User = require('../model/user');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Facade for User operations
class UserFacade {
    async signup(name, password, email, role) {
        const existingUser = await User.findOne({ $or: [{ name }, { email }] });
        if (existingUser) {
            throw new Error('User with this name or email already exists');
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const user = new User({
            name,
            password: hashedPassword,
            email,
            role: role || 'user',
        });

        await user.save();
        return user;
    }

    async login(name, password) {
        const user = await User.findOne({ name });
        if (!user) {
            throw new Error('Invalid credentials');
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            throw new Error('Invalid credentials');
        }

        return user;
    }

    async getUserDetails(userId) {
        const user = await User.findById(userId).select('-password').populate('addresses');
        if (!user) {
            throw new Error('User not found');
        }
        return user;
    }

    async addCollector(name, email, password) {
        if (email) {
            const existingUser = await User.findOne({ email });
            if (existingUser) {
                throw new Error('User with this email already exists.');
            }
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const newCollector = new User({
            name,
            email,
            password: hashedPassword,
            role: 'collector',
        });

        await newCollector.save();
        return newCollector;
    }

    async getAllCollectors() {
        const collectors = await User.find({ role: 'collector' }, 'name email addresses');
        if (collectors.length === 0) {
            throw new Error('No collectors found.');
        }
        return collectors;
    }

    async getAllUsers() {
        return await User.find({}, 'name _id');
    }
}

const userFacade = new UserFacade();

// Signup a new user
exports.signup = async (req, res) => {
    try {
        const { name, password, email, role } = req.body;

        // Check for required fields
        if (!name || !password) {
            return res.status(400).json({ message: 'Name and password are required.' });
        }

        // Use facade to handle signup logic
        const user = await userFacade.signup(name, password, email, role);

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
        res.status(500).json({ message: error.message });
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

        // Use facade to handle login logic
        const user = await userFacade.login(name, password);

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
        res.status(500).json({ message: error.message });
    }
};

// Get user details by ID
exports.getUserDetails = async (req, res) => {
    try {
        const userId = req.params.id;

        // Use facade to get user details
        const user = await userFacade.getUserDetails(userId);
        res.status(200).json(user);
    } catch (error) {
        console.error('Error fetching user details:', error);
        res.status(500).json({ message: error.message });
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
        // Use facade to add a new collector
        const newCollector = await userFacade.addCollector(name, email, password);

        // Respond with a success message
        res.status(201).json({ message: 'Collector added successfully!', collector: newCollector });
    } catch (error) {
        console.error('Error adding collector:', error);
        res.status(500).json({ message: error.message });
    }
};

// Get all users with the role 'collector'
exports.getAllCollectors = async (req, res) => {
    try {
        // Use facade to get all collectors
        const collectors = await userFacade.getAllCollectors();

        // Return the list of collectors
        res.status(200).json(collectors);
    } catch (error) {
        console.error('Error fetching collectors:', error);
        res.status(500).json({ message: error.message });
    }
};

// Fetch all users
exports.getAllUsers = async (req, res) => {
    try {
        // Use facade to get all users
        const users = await userFacade.getAllUsers();
        res.status(200).json({ users });
    } catch (error) {
        console.error('Error fetching users:', error);
        res.status(500).json({ message: error.message });
    }
};
