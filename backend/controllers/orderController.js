const Order = require('../models/Order');

// Place a new order
exports.placeOrder = async (req, res) => {
  try {
    const {
      restaurantId, restaurantName,
      items, subtotal, deliveryFee,
      taxes, total, address
    } = req.body;

    const order = await Order.create({
      user:   req.user.id,
      restaurantId,
      restaurantName,
      items,
      subtotal,
      deliveryFee,
      taxes,
      total,
      address,
    });

    res.status(201).json({ message: 'Order placed!', order });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Get all orders for logged in user
exports.getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user.id }).sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};