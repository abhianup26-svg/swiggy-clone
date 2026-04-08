import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import axios from 'axios';
import { increaseQty, decreaseQty, clearCart } from '../store/cartSlice';
import API_URL from '../config';

export default function Cart() {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { items: cart, restaurant, totalItems } = useSelector(state => state.cart);
  const { token, user } = useSelector(state => state.auth);

  const [loading,       setLoading]       = useState(false);
  const [address,       setAddress]       = useState('');
  const [success,       setSuccess]       = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('razorpay');

  useEffect(() => {
    // Load Razorpay script
    const script  = document.createElement('script');
    script.src    = 'https://checkout.razorpay.com/v1/checkout.js';
    document.body.appendChild(script);
  }, []);

  const subtotal    = cart.reduce((sum, i) => sum + i.price * i.qty, 0);
  const deliveryFee = restaurant?.deliveryFee || 0;
  const taxes       = Math.round(subtotal * 0.05);
  const total       = subtotal + deliveryFee + taxes;

  const orderData = {
    restaurantId:   restaurant?.id,
    restaurantName: restaurant?.name,
    items:          cart.map(i => ({ name: i.name, price: i.price, qty: i.qty })),
    subtotal,
    deliveryFee,
    taxes,
    total,
    address,
  };

  const handleCOD = async () => {
    if (!user || !token) { navigate('/login'); return; }
    if (!address.trim()) { alert('Please enter a delivery address!'); return; }
    setLoading(true);
    try {
      await axios.post(
        `${API_URL}/api/orders`,
        orderData,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      dispatch(clearCart());
      setSuccess(true);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to place order');
    } finally {
      setLoading(false);
    }
  };

  const handleRazorpay = async () => {
    if (!user || !token) { navigate('/login'); return; }
    if (!address.trim()) { alert('Please enter a delivery address!'); return; }
    setLoading(true);

    try {
      const { data } = await axios.post(
        `${API_URL}/api/payment/create-order`,
        { amount: total },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const options = {
        key:         data.keyId,
        amount:      data.amount,
        currency:    data.currency,
        name:        'Swiggy Clone',
        description: `Order from ${restaurant?.name}`,
        order_id:    data.orderId,
        prefill: {
          name:  user.name,
          email: user.email,
        },
        theme: { color: '#fc8019' },

        handler: async (response) => {
          try {
            await axios.post(
              `${API_URL}/api/payment/verify`,
              {
                razorpay_order_id:   response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature:  response.razorpay_signature,
                orderData,
              },
              { headers: { Authorization: `Bearer ${token}` } }
            );
            dispatch(clearCart());
            setSuccess(true);
          } catch (err) {
            alert('Payment verification failed. Please contact support.');
          }
        },

        modal: {
          ondismiss: () => {
            setLoading(false);
            alert('Payment cancelled.');
          }
        }
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
      setLoading(false);

    } catch (err) {
      alert(err.response?.data?.message || 'Payment failed');
      setLoading(false);
    }
  };

  const handlePlaceOrder = () => {
    if (paymentMethod === 'razorpay') handleRazorpay();
    else handleCOD();
  };

  // Success screen
  if (success) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="bg-white rounded-3xl shadow-lg p-10 text-center max-w-md w-full">
        <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
          <span className="text-white text-4xl font-bold">✓</span>
        </div>
        <h2 className="text-3xl font-extrabold text-gray-800 mb-3">
          Order Placed!
        </h2>
        <p className="text-gray-500 mb-2 font-medium">
          {paymentMethod === 'razorpay' ? '💳 Payment successful!' : '💵 Cash on Delivery'}
        </p>
        <p className="text-gray-400 text-sm mb-8">
          Your food will arrive in {restaurant?.deliveryTime || 30} minutes.
        </p>
        <button
          onClick={() => navigate('/')}
          className="bg-orange-500 hover:bg-orange-600 text-white px-8 py-3 rounded-xl font-bold transition-all w-full mb-3"
        >
          Back to Home
        </button>
        <button
          onClick={() => navigate('/orders')}
          className="border-2 border-orange-500 text-orange-500 hover:bg-orange-50 px-8 py-3 rounded-xl font-bold transition-all w-full"
        >
          View My Orders
        </button>
      </div>
    </div>
  );

  // Empty cart screen
  if (cart.length === 0) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="bg-white rounded-3xl shadow-lg p-10 text-center max-w-md w-full">
        <p className="text-7xl mb-4">🛒</p>
        <h2 className="text-2xl font-bold text-gray-800 mb-2">
          Your cart is empty
        </h2>
        <p className="text-gray-500 mb-8">
          Add items from a restaurant to get started
        </p>
        <button
          onClick={() => navigate('/')}
          className="bg-orange-500 hover:bg-orange-600 text-white px-8 py-3 rounded-xl font-bold transition-all w-full"
        >
          Browse Restaurants
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">

      {/* Navbar */}
      <nav className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <button
            onClick={() => navigate(-1)}
            className="text-orange-500 font-semibold hover:text-orange-600 transition-colors"
          >
            ← Back
          </button>
          <span className="text-2xl font-extrabold text-orange-500">swiggy</span>
          <div className="w-16" />
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-6 py-8 flex flex-col lg:flex-row gap-8">

        {/* Left — Cart Items */}
        <div className="flex-1">
          <h2 className="text-2xl font-extrabold text-gray-800 mb-1">
            Your Cart
            <span className="text-base font-normal text-gray-400 ml-2">
              ({totalItems} items)
            </span>
          </h2>
          {restaurant && (
            <p className="text-orange-500 font-semibold text-sm mb-6">
              From: {restaurant.name}
            </p>
          )}

          {/* Cart Items */}
          <div className="space-y-3 mb-6">
            {cart.map(item => (
              <div
                key={item._id}
                className="bg-white rounded-2xl p-4 shadow-sm flex items-center gap-4 hover:shadow-md transition-shadow"
              >
                <div className="flex-1 min-w-0">
                  <h4 className="font-semibold text-gray-800 text-sm mb-1 truncate">
                    {item.name}
                  </h4>
                  <p className="text-gray-400 text-xs">₹{item.price} each</p>
                </div>

                <div className="flex items-center gap-3 bg-orange-500 rounded-lg px-3 py-1.5 flex-shrink-0">
                  <button
                    onClick={() => dispatch(decreaseQty(item._id))}
                    className="text-white font-bold text-lg leading-none"
                  >
                    -
                  </button>
                  <span className="text-white font-bold text-sm min-w-[16px] text-center">
                    {item.qty}
                  </span>
                  <button
                    onClick={() => dispatch(increaseQty(item._id))}
                    className="text-white font-bold text-lg leading-none"
                  >
                    +
                  </button>
                </div>

                <p className="font-bold text-gray-800 text-sm min-w-[60px] text-right flex-shrink-0">
                  ₹{item.price * item.qty}
                </p>
              </div>
            ))}
          </div>

          {/* Delivery Address */}
          <div className="bg-white rounded-2xl p-5 shadow-sm mb-6">
            <h3 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
              📍 Delivery Address
            </h3>
            <textarea
              placeholder="Enter your full delivery address..."
              value={address}
              onChange={e => setAddress(e.target.value)}
              rows={3}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 transition-all resize-none font-medium text-gray-700 placeholder-gray-400"
            />
          </div>

          {/* Payment Method */}
          <div className="bg-white rounded-2xl p-5 shadow-sm">
            <h3 className="font-bold text-gray-800 mb-4">
              💳 Payment Method
            </h3>
            <div className="space-y-3">

              {/* Razorpay */}
              <label className={`flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                paymentMethod === 'razorpay'
                  ? 'border-orange-500 bg-orange-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}>
                <input
                  type="radio"
                  name="payment"
                  value="razorpay"
                  checked={paymentMethod === 'razorpay'}
                  onChange={() => setPaymentMethod('razorpay')}
                  className="accent-orange-500"
                />
                <div className="flex-1">
                  <p className="font-semibold text-gray-800 text-sm">
                    Pay Online
                  </p>
                  <p className="text-xs text-gray-500 mt-0.5">
                    UPI, Cards, Net Banking via Razorpay
                  </p>
                </div>
                <span className="text-orange-500 font-bold text-xs bg-orange-100 px-2 py-1 rounded-lg flex-shrink-0">
                  RECOMMENDED
                </span>
              </label>

              {/* COD */}
              <label className={`flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                paymentMethod === 'cod'
                  ? 'border-orange-500 bg-orange-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}>
                <input
                  type="radio"
                  name="payment"
                  value="cod"
                  checked={paymentMethod === 'cod'}
                  onChange={() => setPaymentMethod('cod')}
                  className="accent-orange-500"
                />
                <div>
                  <p className="font-semibold text-gray-800 text-sm">
                    Cash on Delivery
                  </p>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Pay when your order arrives
                  </p>
                </div>
              </label>

            </div>
          </div>
        </div>

        {/* Right — Bill Summary */}
        <div className="w-full lg:w-80 flex-shrink-0">
          <div className="bg-white rounded-2xl shadow-sm p-6 sticky top-24">
            <h3 className="font-bold text-gray-800 text-lg mb-5">
              Bill Summary
            </h3>

            <div className="space-y-3 mb-4">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">
                  Subtotal ({totalItems} items)
                </span>
                <span className="font-semibold text-gray-700">
                  ₹{subtotal}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Delivery Fee</span>
                <span className="font-semibold text-gray-700">
                  ₹{deliveryFee}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Taxes & Charges (5%)</span>
                <span className="font-semibold text-gray-700">₹{taxes}</span>
              </div>
            </div>

            <div className="border-t border-dashed border-gray-200 pt-4 mb-6">
              <div className="flex justify-between items-center">
                <span className="font-bold text-gray-800">Total</span>
                <span className="font-extrabold text-2xl text-gray-800">
                  ₹{total}
                </span>
              </div>
            </div>

            {/* Payment summary pill */}
            <div className="bg-gray-50 rounded-xl p-3 mb-4 flex items-center gap-2">
              <span className="text-lg">
                {paymentMethod === 'razorpay' ? '💳' : '💵'}
              </span>
              <span className="text-sm font-medium text-gray-700">
                {paymentMethod === 'razorpay'
                  ? 'Pay Online via Razorpay'
                  : 'Cash on Delivery'
                }
              </span>
            </div>

            <button
              onClick={handlePlaceOrder}
              disabled={loading}
              className="w-full bg-orange-500 hover:bg-orange-600 disabled:bg-orange-300 text-white py-4 rounded-xl font-bold text-base transition-all"
            >
              {loading
                ? 'Processing...'
                : paymentMethod === 'razorpay'
                  ? `Pay ₹${total}`
                  : `Place Order • ₹${total}`
              }
            </button>

            <p className="text-center text-xs text-gray-400 mt-3">
              🔒 100% secure payments
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}