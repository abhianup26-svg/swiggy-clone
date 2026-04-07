import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import API_URL from '../config';

export default function Home() {
  const navigate      = useNavigate();
  const user          = JSON.parse(localStorage.getItem('user'));
  const [restaurants, setRestaurants] = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [search,      setSearch]      = useState('');

  useEffect(() => {
    axios.get(`${API_URL}/api/restaurants`)
      .then(res => { setRestaurants(res.data); setLoading(false); })
      .catch(err => { console.log(err); setLoading(false); });
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const filtered = restaurants.filter(r =>
    r.name.toLowerCase().includes(search.toLowerCase()) ||
    r.cuisine.some(c => c.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="min-h-screen bg-gray-50">

      {/* Navbar */}
      <nav className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <span className="text-3xl font-extrabold text-orange-500 tracking-tight">
            swiggy
          </span>
          <div className="flex items-center gap-4">
            {user ? (
              <>
                <span className="text-sm font-semibold text-gray-700">
                  Hey, {user.name}!
                </span>
                {user.role === 'admin' && (
                  <button
                    onClick={() => navigate('/admin')}
                    className="text-sm font-semibold text-purple-600 hover:text-purple-700"
                  >
                    Admin Panel
                  </button>
                )}
                <button
                  onClick={() => navigate('/orders')}
                  className="text-sm font-semibold text-orange-500 hover:text-orange-600"
                >
                  My Orders
                </button>
                <button
                  onClick={handleLogout}
                  className="border-2 border-orange-500 text-orange-500 px-4 py-2 rounded-lg text-sm font-semibold hover:bg-orange-500 hover:text-white transition-all"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => navigate('/login')}
                  className="text-sm font-semibold text-gray-700 hover:text-orange-500"
                >
                  Login
                </button>
                <button
                  onClick={() => navigate('/register')}
                  className="bg-orange-500 text-white px-5 py-2 rounded-lg text-sm font-semibold hover:bg-orange-600 transition-all"
                >
                  Sign Up
                </button>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* Hero */}
      <div className="bg-gradient-to-r from-orange-500 to-orange-400 text-white">
        <div className="max-w-7xl mx-auto px-6 py-16">
          <h1 className="text-5xl font-extrabold mb-4 leading-tight">
            Order food you love
          </h1>
          <p className="text-xl opacity-90 mb-8">
            Delivery in 30 minutes — Bengaluru
          </p>

          {/* Search bar */}
          <div className="relative max-w-xl">
            <input
              type="text"
              placeholder="Search restaurants or cuisines..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full px-6 py-4 rounded-xl text-gray-800 text-base font-medium outline-none shadow-lg"
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 text-xl">
              🔍
            </span>
          </div>
        </div>
      </div>

      {/* Restaurant Grid */}
      <div className="max-w-7xl mx-auto px-6 py-10">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800">
            Restaurants near you
          </h2>
          <span className="text-sm text-gray-500">
            {filtered.length} restaurants
          </span>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1,2,3,4].map(i => (
              <div key={i} className="bg-white rounded-2xl overflow-hidden animate-pulse">
                <div className="h-40 bg-gray-200" />
                <div className="p-4 space-y-3">
                  <div className="h-4 bg-gray-200 rounded w-3/4" />
                  <div className="h-3 bg-gray-200 rounded w-1/2" />
                  <div className="h-3 bg-gray-200 rounded w-2/3" />
                </div>
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-6xl mb-4">🍽️</p>
            <p className="text-xl font-semibold text-gray-600">
              No restaurants found
            </p>
            <p className="text-gray-400 mt-2">Try a different search</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {filtered.map(r => (
              <div
                key={r._id}
                onClick={() => navigate(`/restaurant/${r._id}`)}
                className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer hover:-translate-y-1"
              >
                <div className="relative h-40 overflow-hidden">
                  <img
                    src={r.image}
                    alt={r.name}
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute top-3 right-3 bg-white text-orange-500 text-xs font-bold px-2 py-1 rounded-lg shadow">
                    {r.deliveryTime} mins
                  </div>
                </div>
                <div className="p-4">
                  <h3 className="text-base font-bold text-gray-800 mb-1">
                    {r.name}
                  </h3>
                  <p className="text-xs text-gray-500 mb-3">
                    {r.cuisine.join(', ')}
                  </p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1">
                      <span className="text-orange-500 font-bold text-sm">
                        ★ {r.rating}
                      </span>
                    </div>
                    <span className="text-xs text-gray-500">
                      ₹{r.deliveryFee} delivery
                    </span>
                  </div>
                  <div className="mt-2 pt-2 border-t border-gray-100">
                    <span className="text-xs text-gray-400">
                      Min order: ₹{r.minOrder}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}