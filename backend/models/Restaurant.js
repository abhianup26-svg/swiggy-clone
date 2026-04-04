const mongoose = require('mongoose');

const menuItemSchema = new mongoose.Schema({
  name:        { type: String, required: true },
  description: { type: String, default: '' },
  price:       { type: Number, required: true },
  image:       { type: String, default: '' },
  category:    { type: String, default: 'Main Course' },
  isVeg:       { type: Boolean, default: false },
});

const restaurantSchema = new mongoose.Schema({
  name:        { type: String, required: true },
  image:       { type: String, default: '' },
  cuisine:     { type: [String], default: [] },
  rating:      { type: Number, default: 4.0 },
  deliveryTime:{ type: Number, default: 30 },
  deliveryFee: { type: Number, default: 40 },
  minOrder:    { type: Number, default: 100 },
  address:     { type: String, default: '' },
  isOpen:      { type: Boolean, default: true },
  menu:        [menuItemSchema],
}, { timestamps: true });

module.exports = mongoose.model('Restaurant', restaurantSchema);