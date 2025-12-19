const mongoose = require('mongoose');
require('dotenv').config();

const Menu = require('../models/Menu');
const User = require('../models/User');

const sampleMenu = [
  { itemName: 'Paneer Butter Masala', price: 120, category: 'vegetarian', description: 'Creamy tomato-based curry with soft paneer' },
  { itemName: 'Chicken Tikka Masala', price: 150, category: 'non-vegetarian', description: 'Tender chicken in spiced gravy' },
  { itemName: 'Vegetable Biryani', price: 130, category: 'vegetarian', description: 'Fragrant basmati rice with mixed vegetables' },
  { itemName: 'Dal Makhani', price: 100, category: 'vegetarian', description: 'Creamy black lentils with cream and butter' },
  { itemName: 'Mutton Curry', price: 180, category: 'non-vegetarian', description: 'Slow-cooked tender mutton' },
  { itemName: 'Mixed Vegetable Sabzi', price: 90, category: 'vegetarian', description: 'Seasonal vegetables with light tempering' },
  { itemName: 'Butter Naan', price: 40, category: 'sides', description: 'Soft and fluffy bread' },
  { itemName: 'Plain Rice', price: 60, category: 'sides', description: 'Steamed white basmati rice' },
  { itemName: 'Chai', price: 20, category: 'beverages', description: 'Hot masala tea' },
  { itemName: 'Lassi', price: 40, category: 'beverages', description: 'Yogurt-based drink' }
];

const sampleUsers = [
  { username: 'admin', password: 'admin123', email: 'admin@mhtiffin.com', role: 'admin' },
  { username: 'staff1', password: 'staff123', email: 'staff1@mhtiffin.com', role: 'staff' }
];

async function initData() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');
    
    // Clear existing data
    await Menu.deleteMany({});
    await User.deleteMany({});
    console.log('🗑️  Cleared existing data');
    
    // Insert menu items
    await Menu.insertMany(sampleMenu);
    console.log(`✅ ${sampleMenu.length} menu items initialized`);
    
    // Insert users
    await User.insertMany(sampleUsers);
    console.log(`✅ ${sampleUsers.length} users created`);
    
    console.log('\n📋 Sample Login Credentials:');
    console.log('Admin - Username: admin | Password: admin123');
    console.log('Staff - Username: staff1 | Password: staff123');
    
    process.exit(0);
  } catch (error) {
    console.log('❌ Error:', error.message);
    process.exit(1);
  }
}

initData();
