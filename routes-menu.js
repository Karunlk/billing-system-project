const express = require('express');
const Menu = require('../models/Menu');
const { authMiddleware, adminOnly } = require('../middleware/auth');

const router = express.Router();

// Get all menu items
router.get('/all', async (req, res) => {
  try {
    const items = await Menu.find({ availability: true });
    res.json({ 
      success: true, 
      count: items.length,
      data: items 
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
});

// Add menu item (Admin only)
router.post('/add', authMiddleware, adminOnly, async (req, res) => {
  try {
    const { itemName, price, category, description } = req.body;
    
    // Validate
    if (!itemName || !price || !category) {
      return res.status(400).json({ 
        success: false, 
        message: 'Item name, price, and category are required' 
      });
    }
    
    const menuItem = new Menu({
      itemName,
      price,
      category,
      description
    });
    
    await menuItem.save();
    
    res.status(201).json({ 
      success: true, 
      message: 'Menu item added successfully',
      data: menuItem 
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
});

// Update menu item (Admin only)
router.put('/:id', authMiddleware, adminOnly, async (req, res) => {
  try {
    const menuItem = await Menu.findByIdAndUpdate(
      req.params.id,
      { ...req.body, updatedAt: new Date() },
      { new: true, runValidators: true }
    );
    
    if (!menuItem) {
      return res.status(404).json({ 
        success: false, 
        message: 'Menu item not found' 
      });
    }
    
    res.json({ 
      success: true, 
      message: 'Menu item updated successfully',
      data: menuItem 
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
});

// Delete menu item (Admin only)
router.delete('/:id', authMiddleware, adminOnly, async (req, res) => {
  try {
    const menuItem = await Menu.findByIdAndDelete(req.params.id);
    
    if (!menuItem) {
      return res.status(404).json({ 
        success: false, 
        message: 'Menu item not found' 
      });
    }
    
    res.json({ 
      success: true, 
      message: 'Menu item deleted successfully'
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
});

module.exports = router;
