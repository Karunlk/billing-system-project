const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();

// Register
router.post('/register', async (req, res) => {
  try {
    const { username, password, email, role } = req.body;
    
    // Validate input
    if (!username || !password) {
      return res.status(400).json({ 
        success: false, 
        message: 'Username and password are required' 
      });
    }
    
    // Check if user exists
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(409).json({ 
        success: false, 
        message: 'Username already exists' 
      });
    }
    
    // Create user
    const user = new User({
      username,
      password,
      email,
      role: role || 'staff'
    });
    
    await user.save();
    
    res.status(201).json({ 
      success: true, 
      message: 'User registered successfully',
      user: { username: user.username, role: user.role }
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    
    if (!username || !password) {
      return res.status(400).json({ 
        success: false, 
        message: 'Username and password are required' 
      });
    }
    
    // Find user and include password field
    const user = await User.findOne({ username }).select('+password');
    
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid credentials' 
      });
    }
    
    if (!user.isActive) {
      return res.status(403).json({ 
        success: false, 
        message: 'User account is inactive' 
      });
    }
    
    // Update last login
    user.lastLogin = new Date();
    await user.save();
    
    // Generate JWT
    const token = jwt.sign(
      { 
        id: user._id, 
        username: user.username, 
        role: user.role 
      },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRE || '24h' }
    );
    
    res.json({ 
      success: true, 
      token,
      user: { 
        id: user._id,
        username: user.username, 
        role: user.role,
        email: user.email
      }
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
});

// Verify Token
router.get('/verify', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    res.json({ 
      success: true, 
      user: { 
        id: user._id,
        username: user.username, 
        role: user.role 
      }
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
});

// Logout
router.post('/logout', authMiddleware, (req, res) => {
  res.json({ 
    success: true, 
    message: 'Logged out successfully' 
  });
});

module.exports = router;
