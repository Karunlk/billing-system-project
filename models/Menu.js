const mongoose = require('mongoose');

const menuSchema = new mongoose.Schema({
  itemName: {
    type: String,
    required: true,
    unique: true
  },
  description: String,
  price: {
    type: Number,
    required: true
  },
  category: {
    type: String,
    enum: ['vegetarian', 'non-vegetarian', 'sides', 'beverages'],
    required: true
  },
  availability: {
    type: Boolean,
    default: true
  },
  image: String,
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Menu', menuSchema);
