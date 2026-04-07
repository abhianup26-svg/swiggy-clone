const Razorpay = require('razorpay');
const crypto   = require('crypto');
const Order    = require('../models/Order');

const razorpay = new Razorpay({
  key_id:     process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// Create Razorpay order
exports.createPaymentOrder = async (req, res) => {
  try {
    const { amount } = req.body;

    const options = {
      amount:   amount * 100, // Razorpay uses paise (1 rupee = 100 paise)
      currency: 'INR',
      receipt:  `receipt_${Date.now()}`,
    };

    const order = await razorpay.orders.create(options);
    res.json({
      orderId:  order.id,
      amount:   order.amount,
      currency: order.currency,
      keyId:    process.env.RAZORPAY_KEY_ID,
    });

  } catch (err) {
    res.status(500).json({ message: 'Payment failed', error: err.message });
  }
};

// Verify payment after success
exports.verifyPayment = async (req, res) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      orderData,
    } = req.body;

    // Verify signature
    const body      = razorpay_order_id + '|' + razorpay_payment_id;
    const expected  = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(body)
      .digest('hex');

    if (expected !== razorpay_signature) {
      return res.status(400).json({ message: 'Payment verification failed' });
    }

    // Save order to MongoDB after successful payment
    const order = await Order.create({
      user:           req.user.id,
      restaurantId:   orderData.restaurantId,
      restaurantName: orderData.restaurantName,
      items:          orderData.items,
      subtotal:       orderData.subtotal,
      deliveryFee:    orderData.deliveryFee,
      taxes:          orderData.taxes,
      total:          orderData.total,
      address:        orderData.address,
      paymentId:      razorpay_payment_id,
      paymentStatus:  'Paid',
    });

    res.json({ message: 'Payment verified!', order });

  } catch (err) {
    res.status(500).json({ message: 'Verification failed', error: err.message });
  }
};