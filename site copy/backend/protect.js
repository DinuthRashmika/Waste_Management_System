const jwt = require('jsonwebtoken');

exports.protect = async (req, res, next) => {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            token = req.headers.authorization.split(' ')[1]; // Extract the token

            const decoded = jwt.verify(token, process.env.JWT_SECRET); // Decode the token

            req.userId = decoded.id; // Set the userId from the decoded token

            next();
        } catch (error) {
            res.status(401).json({ message: 'Not authorized, token failed' });
        }
    } else {
        res.status(401).json({ message: 'Not authorized, no token' });
    }
};
exports.admin = async (req, res, next) => {
    if (req.userRole === 'admin') {
        next(); // Proceed if the user is an admin
    } else {
        res.status(403).json({ message: 'Access denied: Admins only' });
    }
};