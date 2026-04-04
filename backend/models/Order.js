const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  user:           { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  restaurantId:   { type: String, required: true },
  restaurantName: { type: String, required: true },
  items: [{
    name:  String,
    price: Number,
    qty:   Number,
  }],
  subtotal:    { type: Number, required: true },
  deliveryFee: { type: Number, required: true },
  taxes:       { type: Number, required: true },
  total:       { type: Number, required: true },
  address:     { type: String, required: true },
  status:      { type: String, default: 'Preparing', enum: ['Preparing', 'On the way', 'Delivered'] },
}, { timestamps: true });

module.exports = mongoose.model('Order', orderSchema);