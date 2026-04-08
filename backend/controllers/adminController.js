const User       = require('../models/User');
const Restaurant = require('../models/Restaurant');
const Order      = require('../models/Order');

exports.getStats = async (req, res) => {
  try {
    const totalUsers       = await User.countDocuments();
    const totalRestaurants = await Restaurant.countDocuments();
    const totalOrders      = await Order.countDocuments();
    const orders           = await Order.find();
    const totalRevenue     = orders.reduce((sum, o) => sum + o.total, 0);
    const recentOrders     = await Order.find()
      .sort({ createdAt: -1 })
      .limit(5);

    res.json({ totalUsers, totalRestaurants, totalOrders, totalRevenue, recentOrders });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 });
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

exports.getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find()
      .sort({ createdAt: -1 })
      .populate('user', 'name email');
    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// This is where Socket.io magic happens!
exports.updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;

    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    ).populate('user', 'name email');

    if (!order) return res.status(404).json({ message: 'Order not found' });

    // Emit socket event to the user who placed the order
    const io = req.app.get('io');
    io.to(order.user._id.toString()).emit('orderStatusUpdate', {
      orderId:    order._id,
      status:     order.status,
      restaurant: order.restaurantName,
    });

    console.log(`Status update emitted to user: ${order.user._id}`);

    res.json({ message: 'Order status updated!', order });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

exports.addRestaurant = async (req, res) => {
  try {
    const restaurant = await Restaurant.create(req.body);
    res.status(201).json({ message: 'Restaurant added!', restaurant });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

exports.updateRestaurant = async (req, res) => {
  try {
    const restaurant = await Restaurant.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    if (!restaurant) return res.status(404).json({ message: 'Restaurant not found' });
    res.json({ message: 'Restaurant updated!', restaurant });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

exports.deleteRestaurant = async (req, res) => {
  try {
    await Restaurant.findByIdAndDelete(req.params.id);
    res.json({ message: 'Restaurant deleted!' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};