import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import API_URL from '../config';

export default function RestaurantDetail() {
  const { id }   = useParams();
  const navigate = useNavigate();
  const [restaurant, setRestaurant] = useState(null);
  const [loading,    setLoading]    = useState(true);
  const [cart,       setCart]       = useState([]);
  const [activeCategory, setActiveCategory] = useState('');

  useEffect(() => {
    axios.get(`${API_URL}/api/restaurants/${id}`)
      .then(res => {
        setRestaurant(res.data);
        const cats = [...new Set(res.data.menu.map(i => i.category))];
        setActiveCategory(cats[0]);
        setLoading(false);
      })
      .catch(err => { console.log(err); setLoading(false); });
  }, [id]);

  const addToCart = (item) => {
    setCart(prev => {
      const exists = prev.find(i => i._id === item._id);
      if (exists) return prev.map(i => i._id === item._id ? { ...i, qty: i.qty + 1 } : i);
      return [...prev, { ...item, qty: 1 }];
    });
  };

  const removeFromCart = (item) => {
    setCart(prev => {
      const exists = prev.find(i => i._id === item._id);
      if (exists && exists.qty > 1) return prev.map(i => i._id === item._id ? { ...i, qty: i.qty - 1 } : i);
      return prev.filter(i => i._id !== item._id);
    });
  };

  const getQty     = (itemId) => { const f = cart.find(i => i._id === itemId); return f ? f.qty : 0; };
  const totalItems = cart.reduce((sum, i) => sum + i.qty, 0);
  const totalPrice = cart.reduce((sum, i) => sum + i.price * i.qty, 0);
  const categories = restaurant ? [...new Set(restaurant.menu.map(i => i.category))] : [];

  if (loading) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-gray-500 font-medium">Loading menu...</p>
      </div>
    </div>
  );

  if (!restaurant) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <p className="text-gray-500">Restaurant not found.</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 pb-28">

      {/* Navbar */}
      <nav className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-2 text-orange-500 font-semibold hover:text-orange-600 transition-colors"
          >
            ← Back
          </button>
          <span className="text-2xl font-extrabold text-orange-500">swiggy</span>
          <div className="w-16" />
        </div>
      </nav>

      {/* Restaurant Header */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-extrabold text-gray-800 mb-2">
                {restaurant.name}
              </h1>
              <p className="text-gray-500 text-sm mb-1">
                {restaurant.cuisine.join(', ')}
              </p>
              <p className="text-gray-400 text-sm mb-4">
                📍 {restaurant.address}
              </p>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1 bg-green-50 px-3 py-1 rounded-lg">
                  <span className="text-green-600 font-bold text-sm">
                    ★ {restaurant.rating}
                  </span>
                </div>
                <div className="flex items-center gap-1 bg-orange-50 px-3 py-1 rounded-lg">
                  <span className="text-orange-600 font-bold text-sm">
                    🕒 {restaurant.deliveryTime} mins
                  </span>
                </div>
                <div className="flex items-center gap-1 bg-blue-50 px-3 py-1 rounded-lg">
                  <span className="text-blue-600 font-bold text-sm">
                    ₹{restaurant.deliveryFee} delivery
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-6 flex gap-6">

        {/* Category sidebar */}
        <div className="hidden md:block w-48 flex-shrink-0">
          <div className="bg-white rounded-2xl shadow-sm p-4 sticky top-24">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">
              Menu
            </p>
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium mb-1 transition-all ${
                  activeCategory === cat
                    ? 'bg-orange-500 text-white'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Menu Items */}
        <div className="flex-1">

          {/* Mobile category tabs */}
          <div className="flex gap-2 overflow-x-auto pb-3 mb-4 md:hidden">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-all ${
                  activeCategory === cat
                    ? 'bg-orange-500 text-white'
                    : 'bg-white text-gray-600 border border-gray-200'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {categories.map(category => (
            <div key={category} className="mb-8">
              <h2 className="text-lg font-bold text-gray-800 mb-4 pb-2 border-b border-gray-100">
                {category}
              </h2>
              <div className="space-y-3">
                {restaurant.menu
                  .filter(item => item.category === category)
                  .map(item => (
                    <div
                      key={item._id}
                      className="bg-white rounded-2xl p-4 shadow-sm flex items-center gap-4 hover:shadow-md transition-shadow"
                    >
                      {/* Veg/Non-veg indicator */}
                      <div className={`w-5 h-5 border-2 rounded flex items-center justify-center flex-shrink-0 ${
                        item.isVeg ? 'border-green-500' : 'border-red-500'
                      }`}>
                        <div className={`w-2.5 h-2.5 rounded-full ${
                          item.isVeg ? 'bg-green-500' : 'bg-red-500'
                        }`} />
                      </div>

                      {/* Item details */}
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-gray-800 text-sm mb-1">
                          {item.name}
                        </h3>
                        <p className="text-xs text-gray-400 mb-2 truncate">
                          {item.description}
                        </p>
                        <p className="font-bold text-gray-800 text-sm">
                          ₹{item.price}
                        </p>
                      </div>

                      {/* Add button */}
                      <div className="flex-shrink-0">
                        {getQty(item._id) === 0 ? (
                          <button
                            onClick={() => addToCart(item)}
                            className="border-2 border-orange-500 text-orange-500 hover:bg-orange-500 hover:text-white px-5 py-1.5 rounded-lg text-sm font-bold transition-all"
                          >
                            ADD
                          </button>
                        ) : (
                          <div className="flex items-center gap-3 bg-orange-500 rounded-lg px-3 py-1.5">
                            <button
                              onClick={() => removeFromCart(item)}
                              className="text-white font-bold text-lg leading-none"
                            >
                              -
                            </button>
                            <span className="text-white font-bold text-sm min-w-[16px] text-center">
                              {getQty(item._id)}
                            </span>
                            <button
                              onClick={() => addToCart(item)}
                              className="text-white font-bold text-lg leading-none"
                            >
                              +
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Cart bar */}
      {totalItems > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 w-11/12 max-w-lg z-50">
          <button
            onClick={() => {
              localStorage.setItem('cart', JSON.stringify(cart));
              localStorage.setItem('restaurant', JSON.stringify({
                id: restaurant._id,
                name: restaurant.name,
                deliveryFee: restaurant.deliveryFee,
              }));
              navigate('/cart');
            }}
            className="w-full bg-orange-500 hover:bg-orange-600 text-white rounded-2xl px-6 py-4 flex items-center justify-between shadow-xl transition-all"
          >
            <div className="flex items-center gap-3">
              <span className="bg-orange-600 text-white text-xs font-bold px-2 py-1 rounded-lg">
                {totalItems}
              </span>
              <span className="font-semibold text-sm">
                {totalItems} item{totalItems > 1 ? 's' : ''} added
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-bold">₹{totalPrice}</span>
              <span className="font-bold">→</span>
            </div>
          </button>
        </div>
      )}

    </div>
  );
}