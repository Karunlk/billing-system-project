const express = require('express');
const Transaction = require('../models/Transaction');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();

// Create transaction
router.post('/create', authMiddleware, async (req, res) => {
  try {
    const transaction = new Transaction({
      ...req.body,
      createdBy: req.user.id
    });
    
    await transaction.save();
    
    res.status(201).json({ 
      success: true, 
      message: 'Transaction created successfully',
      data: transaction
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
});

// Get all transactions
router.get('/all', authMiddleware, async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    let filter = {};
    
    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) filter.createdAt.$gte = new Date(startDate);
      if (endDate) filter.createdAt.$lte = new Date(endDate);
    }
    
   const transactions = await Transaction.find({
  ...filter,
  createdBy: req.user.id
})
      .populate('createdBy', 'username')
      .sort({ createdAt: -1 });
    
    res.json({ 
      success: true, 
      count: transactions.length,
      data: transactions 
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
});

// Get transaction by ID
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const transaction = await Transaction.findById(req.params.id)
      .populate('createdBy', 'username');
    
    if (!transaction) {
      return res.status(404).json({ 
        success: false, 
        message: 'Transaction not found' 
      });
    }
    
    res.json({ 
      success: true, 
      data: transaction 
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
});

// Get daily stats
router.get('/stats/daily', authMiddleware, async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const transactions = await Transaction.find({
      createdAt: { $gte: today, $lt: tomorrow },
      status: 'paid'
    });
    
    const totalRevenue = transactions.reduce((sum, t) => sum + t.totalAmount, 0);
    const totalOrders = transactions.length;
    const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;
    
    res.json({ 
      success: true, 
      data: { 
        totalRevenue, 
        totalOrders, 
        avgOrderValue,
        transactions: transactions.length
      }
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
});

// Get monthly revenue
router.get('/stats/monthly', authMiddleware, async (req, res) => {
  try {
    const transactions = await Transaction.aggregate([
      {
        $match: { status: 'paid' }
      },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m', date: '$createdAt' } },
          totalRevenue: { $sum: '$totalAmount' },
          totalOrders: { $sum: 1 }
        }
      },
      { $sort: { _id: -1 } },
      { $limit: 12 }
    ]);
    
    res.json({ 
      success: true, 
      data: transactions 
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
});

module.exports = router;
