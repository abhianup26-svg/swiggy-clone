import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import API_URL from '../config';

export default function Cart() {
  const navigate = useNavigate();
  const [cart,       setCart]       = useState([]);
  const [restaurant, setRestaurant] = useState(null);
  const [loading,    setLoading]    = useState(false);
  const [address,    setAddress]    = useState('');
  const [success,    setSuccess]    = useState(false);

  useEffect(() => {
    const savedCart       = JSON.parse(localStorage.getItem('cart'))       || [];
    const savedRestaurant = JSON.parse(localStorage.getItem('restaurant')) || null;
    setCart(savedCart);
    setRestaurant(savedRestaurant);
  }, []);

  const increaseQty = (itemId) => setCart(prev =>
    prev.map(i => i._id === itemId ? { ...i, qty: i.qty + 1 } : i)
  );

  const decreaseQty = (itemId) => setCart(prev => {
    const item = prev.find(i => i._id === itemId);
    if (item.qty === 1) return prev.filter(i => i._id !== itemId);
    return prev.map(i => i._id === itemId ? { ...i, qty: i.qty - 1 } : i);
  });

  const subtotal    = cart.reduce((sum, i) => sum + i.price * i.qty, 0);
  const deliveryFee = restaurant?.deliveryFee || 0;
  const taxes       = Math.round(subtotal * 0.05);
  const total       = subtotal + deliveryFee + taxes;
  const totalItems  = cart.reduce((sum, i) => sum + i.qty, 0);

  const placeOrder = async () => {
    const user  = JSON.parse(localStorage.getItem('user'));
    const token = localStorage.getItem('token');
    if (!user || !token) { navigate('/login'); return; }
    if (!address.trim()) { alert('Please enter a delivery address!'); return; }
    setLoading(true);
    try {
      await axios.post(
        `${API_URL}/api/orders`,
        {
          restaurantId:   restaurant.id,
          restaurantName: restaurant.name,
          items: cart.map(i => ({ name: i.name, price: i.price, qty: i.qty })),
          subtotal, deliveryFee, taxes, total, address,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      localStorage.removeItem('cart');
      localStorage.removeItem('restaurant');
      setSuccess(true);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to place order');
    } finally {
      setLoading(false);
    }
  };

  if (success) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="bg-white rounded-3xl shadow-lg p-10 text-center max-w-md w-full">
        <div className="w-20 h-20 bg-orange-500 rounded-full flex items-center justify-center mx-auto mb-6">
          <span className="text-white text-4xl">✓</span>
        </div>
        <h2 className="text-3xl font-extrabold text-gray-800 mb-3">
          Order Placed!
        </h2>
        <p className="text-gray-500 mb-8">
          Your food is being prepared and will arrive in {restaurant?.deliveryTime || 30} minutes.
        </p>
        <button
          onClick={() => navigate('/')}
          className="bg-orange-500 hover:bg-orange-600 text-white px-8 py-3 rounded-xl font-bold transition-all w-full"
        >
          Back to Home
        </button>
        <button
          onClick={() => navigate('/orders')}
          className="mt-3 border-2 border-orange-500 text-orange-500 hover:bg-orange-50 px-8 py-3 rounded-xl font-bold transition-all w-full"
        >
          View My Orders
        </button>
      </div>
    </div>
  );

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
          </h2>
          {restaurant && (
            <p className="text-orange-500 font-semibold text-sm mb-6">
              From: {restaurant.name}
            </p>
          )}

          {/* Items */}
          <div className="space-y-3 mb-6">
            {cart.map(item => (
              <div
                key={item._id}
                className="bg-white rounded-2xl p-4 shadow-sm flex items-center gap-4"
              >
                <div className="flex-1">
                  <h4 className="font-semibold text-gray-800 text-sm mb-1">
                    {item.name}
                  </h4>
                  <p className="text-gray-400 text-xs">₹{item.price} each</p>
                </div>
                <div className="flex items-center gap-3 bg-orange-500 rounded-lg px-3 py-1.5">
                  <button
                    onClick={() => decreaseQty(item._id)}
                    className="text-white font-bold text-lg leading-none"
                  >
                    -
                  </button>
                  <span className="text-white font-bold text-sm min-w-[16px] text-center">
                    {item.qty}
                  </span>
                  <button
                    onClick={() => increaseQty(item._id)}
                    className="text-white font-bold text-lg leading-none"
                  >
                    +
                  </button>
                </div>
                <p className="font-bold text-gray-800 text-sm min-w-[60px] text-right">
                  ₹{item.price * item.qty}
                </p>
              </div>
            ))}
          </div>

          {/* Delivery Address */}
          <div className="bg-white rounded-2xl p-5 shadow-sm">
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
                <span className="font-semibold text-gray-700">₹{subtotal}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Delivery Fee</span>
                <span className="font-semibold text-gray-700">₹{deliveryFee}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Taxes & Charges (5%)</span>
                <span className="font-semibold text-gray-700">₹{taxes}</span>
              </div>
            </div>

            <div className="border-t border-dashed border-gray-200 pt-4 mb-6">
              <div className="flex justify-between">
                <span className="font-bold text-gray-800">Total</span>
                <span className="font-extrabold text-xl text-gray-800">
                  ₹{total}
                </span>
              </div>
            </div>

            <button
              onClick={placeOrder}
              disabled={loading}
              className="w-full bg-orange-500 hover:bg-orange-600 disabled:bg-orange-300 text-white py-4 rounded-xl font-bold text-base transition-all"
            >
              {loading ? 'Placing Order...' : `Place Order • ₹${total}`}
            </button>

            <p className="text-center text-xs text-gray-400 mt-3">
              Cash on Delivery • Payments coming soon
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}