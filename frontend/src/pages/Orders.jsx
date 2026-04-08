import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import axios from 'axios';
import socket from '../socket/socket';
import API_URL from '../config';

export default function Orders() {
  const navigate          = useNavigate();
  const { user, token }   = useSelector(state => state.auth);
  const [orders,  setOrders]  = useState([]);
  const [loading, setLoading] = useState(true);
  const [liveUpdate, setLiveUpdate] = useState(null);
  const notifRef = useRef(null);

  useEffect(() => {
    if (!token) { navigate('/login'); return; }

    // Fetch orders
    axios.get(`${API_URL}/api/orders/mine`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => { setOrders(res.data); setLoading(false); })
      .catch(err => { console.log(err); setLoading(false); });

    // Connect socket and join user's room
    socket.connect();
    socket.emit('join', user.id);

    // Listen for real-time order status updates
    socket.on('orderStatusUpdate', (data) => {
      console.log('Live update received:', data);

      // Update the order in state
      setOrders(prev => prev.map(order =>
        order._id === data.orderId
          ? { ...order, status: data.status }
          : order
      ));

      // Show live notification
      setLiveUpdate(data);
      clearTimeout(notifRef.current);
      notifRef.current = setTimeout(() => setLiveUpdate(null), 5000);
    });

    return () => {
      socket.off('orderStatusUpdate');
      socket.disconnect();
    };
  }, []);

  const getStatusColor = (status) => {
    if (status === 'Delivered')  return 'bg-green-100 text-green-700 border border-green-200';
    if (status === 'On the way') return 'bg-orange-100 text-orange-700 border border-orange-200';
    return 'bg-blue-100 text-blue-700 border border-blue-200';
  };

  const getStatusIcon = (status) => {
    if (status === 'Delivered')  return '✓';
    if (status === 'On the way') return '🛵';
    return '👨‍🍳';
  };

  const formatDate = (dateStr) => new Date(dateStr).toLocaleDateString('en-IN', {
    day: 'numeric', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });

  return (
    <div className="min-h-screen bg-gray-50">

      {/* Navbar */}
      <nav className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <button
            onClick={() => navigate('/')}
            className="text-orange-500 font-semibold hover:text-orange-600 transition-colors"
          >
            ← Back
          </button>
          <span className="text-2xl font-extrabold text-orange-500">swiggy</span>
          <div className="w-16" />
        </div>
      </nav>

      {/* Live update notification */}
      {liveUpdate && (
        <div className="fixed top-20 right-4 z-50 animate-bounce">
          <div className="bg-white rounded-2xl shadow-xl border-l-4 border-orange-500 p-4 max-w-sm">
            <div className="flex items-start gap-3">
              <span className="text-2xl">
                {getStatusIcon(liveUpdate.status)}
              </span>
              <div>
                <p className="font-bold text-gray-800 text-sm">
                  Order Update!
                </p>
                <p className="text-gray-600 text-xs mt-0.5">
                  Your order from {liveUpdate.restaurant} is now
                </p>
                <p className="text-orange-500 font-bold text-sm mt-1">
                  {liveUpdate.status}
                </p>
              </div>
              <button
                onClick={() => setLiveUpdate(null)}
                className="text-gray-400 hover:text-gray-600 text-lg ml-auto"
              >
                ×
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-3xl mx-auto px-6 py-8">

        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-3xl font-extrabold text-gray-800">
              Your Orders
            </h2>
            <p className="text-gray-500 text-sm mt-1">
              {orders.length} order{orders.length !== 1 ? 's' : ''} placed
            </p>
          </div>

          {/* Live indicator */}
          <div className="flex items-center gap-2 bg-green-50 border border-green-200 px-3 py-1.5 rounded-full">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            <span className="text-green-700 text-xs font-semibold">
              Live tracking
            </span>
          </div>
        </div>

        {loading ? (
          <div className="space-y-4">
            {[1,2,3].map(i => (
              <div key={i} className="bg-white rounded-2xl p-6 animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-1/2 mb-3" />
                <div className="h-3 bg-gray-200 rounded w-1/3 mb-4" />
                <div className="h-3 bg-gray-200 rounded w-2/3" />
              </div>
            ))}
          </div>
        ) : orders.length === 0 ? (
          <div className="bg-white rounded-3xl shadow-sm p-12 text-center">
            <p className="text-7xl mb-4">📦</p>
            <h3 className="text-xl font-bold text-gray-800 mb-2">
              No orders yet!
            </h3>
            <p className="text-gray-500 mb-6">
              Your order history will appear here
            </p>
            <button
              onClick={() => navigate('/')}
              className="bg-orange-500 hover:bg-orange-600 text-white px-8 py-3 rounded-xl font-bold transition-all"
            >
              Order Now
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map(order => (
              <div
                key={order._id}
                className="bg-white rounded-2xl shadow-sm overflow-hidden hover:shadow-md transition-shadow"
              >
                {/* Order header */}
                <div className="p-5 flex justify-between items-start border-b border-gray-50">
                  <div>
                    <h3 className="font-bold text-gray-800 text-lg mb-1">
                      {order.restaurantName}
                    </h3>
                    <p className="text-gray-400 text-xs">
                      {formatDate(order.createdAt)}
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <span className={`px-3 py-1.5 rounded-full text-xs font-bold flex items-center gap-1.5 ${getStatusColor(order.status)}`}>
                      <span>{getStatusIcon(order.status)}</span>
                      {order.status}
                    </span>
                    {order.paymentStatus === 'Paid' && (
                      <span className="bg-green-50 text-green-600 text-xs font-semibold px-2 py-0.5 rounded-full border border-green-200">
                        💳 Paid
                      </span>
                    )}
                  </div>
                </div>

                {/* Progress bar */}
                <div className="px-5 pt-4">
                  <div className="flex items-center justify-between mb-2">
                    {['Preparing', 'On the way', 'Delivered'].map((step, i) => {
                      const steps    = ['Preparing', 'On the way', 'Delivered'];
                      const current  = steps.indexOf(order.status);
                      const isDone   = i <= current;
                      const isActive = i === current;
                      return (
                        <div key={step} className="flex items-center flex-1">
                          <div className="flex flex-col items-center">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all ${
                              isActive
                                ? 'bg-orange-500 text-white scale-110'
                                : isDone
                                  ? 'bg-green-500 text-white'
                                  : 'bg-gray-100 text-gray-400'
                            }`}>
                              {isDone && !isActive ? '✓' : i + 1}
                            </div>
                            <p className={`text-xs mt-1 font-medium ${
                              isActive
                                ? 'text-orange-500'
                                : isDone
                                  ? 'text-green-600'
                                  : 'text-gray-400'
                            }`}>
                              {step === 'On the way' ? 'On way' : step}
                            </p>
                          </div>
                          {i < 2 && (
                            <div className={`flex-1 h-1 mx-2 rounded-full transition-all ${
                              i < current ? 'bg-green-400' : 'bg-gray-100'
                            }`} />
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Order items */}
                <div className="px-5 py-4 border-b border-gray-50">
                  <div className="flex flex-wrap gap-2">
                    {order.items.map((item, i) => (
                      <div
                        key={i}
                        className="flex items-center gap-1.5 bg-gray-50 rounded-lg px-3 py-1.5"
                      >
                        <span className="text-orange-500 font-bold text-xs">
                          {item.qty}x
                        </span>
                        <span className="text-gray-600 text-xs font-medium">
                          {item.name}
                        </span>
                        <span className="text-gray-400 text-xs">
                          ₹{item.price * item.qty}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Order footer */}
                <div className="px-5 py-4 flex justify-between items-center">
                  <div className="flex gap-4 text-xs text-gray-400">
                    <span>Subtotal: ₹{order.subtotal}</span>
                    <span>Delivery: ₹{order.deliveryFee}</span>
                    <span>Tax: ₹{order.taxes}</span>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-gray-400 mb-0.5">Total Paid</p>
                    <p className="text-xl font-extrabold text-orange-500">
                      ₹{order.total}
                    </p>
                  </div>
                </div>

                {/* Address */}
                <div className="px-5 pb-4">
                  <p className="text-xs text-gray-400 bg-gray-50 rounded-lg px-3 py-2">
                    📍 {order.address}
                  </p>
                </div>

              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}