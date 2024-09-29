const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
const pool = require('../db');
const { authenticateToken, checkUserStatus, isAdmin } = require('../middleware/authMiddleware');
const router = express.Router();

dotenv.config();

// Register route
router.post('/register', async (req, res) => {
  const { name, email, password } = req.body;

  if (!password) {
    return res.status(400).send('Password cannot be empty');
  }

  try {
    // Check if user already exists
    const userExists = await pool.query('SELECT * FROM users WHERE email = $1', [email]);

    if (userExists.rows.length > 0) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert new user
    const result = await pool.query(
      'INSERT INTO users (name, email, password, role, status) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [name, email, hashedPassword, 'user', 'active']
    );

    res.json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Login route
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  if (!password) {
    return res.status(400).send('Password cannot be empty');
  }

  try {
    // Check if user exists
    const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    if (result.rows.length === 0) {
      return res.status(401).send('Invalid email or password');
    }

    const user = result.rows[0];

    // Check if the user is blocked
    if (user.status === 'blocked') {
      return res.status(403).json({ message: 'Your account is blocked. Please contact support.' });
    }

    // Compare the passwords
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).send('Invalid email or password');
    }

    // Generate JWT token
    const token = jwt.sign({ userId: user.id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1h' });

    res.json({ token });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get all users (Any authenticated user)
router.get('/', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query('SELECT id, name, email, role, status, registration_time, last_login FROM users');
    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update user status (block/unblock) (Any authenticated user)
router.put('/:id/status', authenticateToken, async (req, res) => {
  const { id } = req.params;
  const { status } = req.body; // Expected to receive either 'active' or 'blocked'

  // Validate status value
  if (!['active', 'blocked'].includes(status)) {
    return res.status(400).json({ message: 'Invalid status value' });
  }

  try {
    const result = await pool.query(
      'UPDATE users SET status = $1 WHERE id = $2 RETURNING id, name, email, status',
      [status, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete a user (Any authenticated user)
router.delete('/:id', authenticateToken, async (req, res) => {
  const { id } = req.params;

  try {
    const result = await pool.query('DELETE FROM users WHERE id = $1 RETURNING id, name, email', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({ message: 'User deleted successfully', user: result.rows[0] });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Protected route - only for authenticated users
router.get('/profile', authenticateToken, async (req, res) => {
  try {
    const user = await pool.query('SELECT * FROM users WHERE id = $1', [req.user.userId]);
    res.json(user.rows[0]);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Admin route - only for authenticated users to get all users
router.get('/admin', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM users');
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;

