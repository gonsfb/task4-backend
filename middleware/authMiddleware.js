const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
const pool = require('../db');
dotenv.config();

// Middleware to verify token and permission, and check user status
const authenticateToken = async (req, res, next) => {
  const authHeader = req.headers['authorization'];

  // Debugging: Check if the Authorization header is received
  console.log('Authorization Header:', authHeader);

  if (!authHeader) {
    return res.status(401).json({ message: 'Access denied. No token provided.' });
  }

  // Split the "Bearer <token>" to extract only the token
  const token = authHeader.split(' ')[1];

  // Debugging: Check if the token is being extracted properly
  console.log('Extracted Token:', token);

  try {
    // Verify the token with the secret
    const verified = jwt.verify(token, process.env.JWT_SECRET);

    // Debugging: Check the content of the verified token
    console.log('Verified Token:', verified);

    // Fetch the user from the database to check their status
    const userResult = await pool.query('SELECT * FROM users WHERE id = $1', [verified.userId]);

    if (userResult.rows.length === 0) {
      return res.status(403).json({ message: 'User not found. Please log in again.' });
    }

    const user = userResult.rows[0];

    // Check if the user is blocked
    if (user.status === 'blocked') {
      return res.status(403).json({ message: 'Your account is blocked. Please contact support.' });
    }

    // Attach the verified user info to the req object
    req.user = verified;
    next();
  } catch (error) {
    // Debugging: Log the error if verification fails
    console.error('JWT Verification Error:', error);
    return res.status(403).json({ message: 'Invalid token' });
  }
};

// Middleware to check admin role (optional use for certain actions)
const isAdmin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    return res.status(403).json({ message: 'Access denied. Not an admin.' });
  }
};

module.exports = {
  authenticateToken,
  isAdmin,
};

