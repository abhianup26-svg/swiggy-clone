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
  const [sortBy,      setSortBy]      = useState('default');
  const [vegOnly,     setVegOnly]     = useState(false);
  const [activeCuisine, setActiveCuisine] = useState('All');

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

  // Get all unique cuisines from all restaurants
  const allCuisines = ['All', ...new Set(
    restaurants.flatMap(r => r.cuisine)
  )];

  // Apply all filters
  let filtered = restaurants.filter(r => {
    const matchesSearch  = r.name.toLowerCase().includes(search.toLowerCase()) ||
                           r.cuisine.some(c => c.toLowerCase().includes(search.toLowerCase()));
    const matchesCuisine = activeCuisine === 'All' || r.cuisine.includes(activeCuisine);
    return matchesSearch && matchesCuisine;
  });

  // Apply sorting
  if (sortBy === 'rating') {
    filtered = [...filtered].sort((a, b) => b.rating - a.rating);
  } else if (sortBy === 'delivery_time') {
    filtered = [...filtered].sort((a, b) => a.deliveryTime - b.deliveryTime);
  } else if (sortBy === 'delivery_fee') {
    filtered = [...filtered].sort((a, b) => a.deliveryFee - b.deliveryFee);
  }

  const hasActiveFilters = search || activeCuisine !== 'All' || sortBy !== 'default' || vegOnly;

  const resetFilters = () => {
    setSearch('');
    setActiveCuisine('All');
    setSortBy('default');
    setVegOnly(false);
  };

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
                <span className="text-sm font-semibold text-gray-700 hidden md:block">
                  Hey, {user.name}!
                </span>
                {user.role === 'admin' && (
                  <button
                    onClick={() => navigate('/admin')}
                    className="text-sm font-semibold text-purple-600 hover:text-purple-700"
                  >
                    Admin
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

      {/* Hero with search */}
      <div className="bg-gradient-to-r from-orange-500 to-orange-400 text-white">
        <div className="max-w-7xl mx-auto px-6 py-14">
          <h1 className="text-5xl font-extrabold mb-3 leading-tight">
            Order food you love
          </h1>
          <p className="text-xl opacity-90 mb-8">
            Delivery in 30 minutes — Bengaluru
          </p>

          {/* Search bar */}
          <div className="relative max-w-2xl">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-xl">
              🔍
            </span>
            <input
              type="text"
              placeholder="Search restaurants, cuisines..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-12 pr-6 py-4 rounded-xl text-gray-800 text-base font-medium outline-none shadow-lg"
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-xl"
              >
                ×
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Filters section */}
      <div className="bg-white border-b border-gray-100 sticky top-16 z-40 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-3">

          {/* Cuisine chips + Sort + Veg toggle all in one row */}
          <div className="flex items-center gap-3 overflow-x-auto pb-1 scrollbar-hide">

            {/* Veg toggle */}
            <button
              onClick={() => setVegOnly(!vegOnly)}
              className={`flex-shrink-0 flex items-center gap-2 px-4 py-2 rounded-full border-2 text-sm font-semibold transition-all ${
                vegOnly
                  ? 'bg-green-500 border-green-500 text-white'
                  : 'border-gray-200 text-gray-600 hover:border-green-400'
              }`}
            >
              <span className={`w-3 h-3 rounded-full border-2 flex items-center justify-center ${
                vegOnly ? 'border-white' : 'border-green-500'
              }`}>
                <span className={`w-1.5 h-1.5 rounded-full ${
                  vegOnly ? 'bg-white' : 'bg-green-500'
                }`} />
              </span>
              Veg Only
            </button>

            {/* Divider */}
            <div className="h-6 w-px bg-gray-200 flex-shrink-0" />

            {/* Sort options */}
            <select
              value={sortBy}
              onChange={e => setSortBy(e.target.value)}
              className={`flex-shrink-0 px-4 py-2 rounded-full border-2 text-sm font-semibold outline-none cursor-pointer transition-all ${
                sortBy !== 'default'
                  ? 'border-orange-500 bg-orange-50 text-orange-600'
                  : 'border-gray-200 text-gray-600'
              }`}
            >
              <option value="default">Sort by</option>
              <option value="rating">Top Rated</option>
              <option value="delivery_time">Fastest Delivery</option>
              <option value="delivery_fee">Lowest Delivery Fee</option>
            </select>

            {/* Divider */}
            <div className="h-6 w-px bg-gray-200 flex-shrink-0" />

            {/* Cuisine filter chips */}
            {allCuisines.map(cuisine => (
              <button
                key={cuisine}
                onClick={() => setActiveCuisine(cuisine)}
                className={`flex-shrink-0 px-4 py-2 rounded-full border-2 text-sm font-semibold transition-all ${
                  activeCuisine === cuisine
                    ? 'bg-orange-500 border-orange-500 text-white'
                    : 'border-gray-200 text-gray-600 hover:border-orange-300 hover:text-orange-500'
                }`}
              >
                {cuisine}
              </button>
            ))}

            {/* Reset filters */}
            {hasActiveFilters && (
              <>
                <div className="h-6 w-px bg-gray-200 flex-shrink-0" />
                <button
                  onClick={resetFilters}
                  className="flex-shrink-0 px-4 py-2 rounded-full border-2 border-red-200 text-red-500 text-sm font-semibold hover:bg-red-50 transition-all"
                >
                  Clear All ×
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Results count + active filters summary */}
      <div className="max-w-7xl mx-auto px-6 pt-6 pb-2">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-gray-800">
              {activeCuisine !== 'All' ? activeCuisine : 'All'} Restaurants
            </h2>
            <p className="text-sm text-gray-500 mt-0.5">
              {filtered.length} restaurant{filtered.length !== 1 ? 's' : ''} found
              {search && ` for "${search}"`}
            </p>
          </div>

          {/* Active filter pills */}
          <div className="flex items-center gap-2">
            {sortBy !== 'default' && (
              <span className="bg-orange-100 text-orange-600 text-xs font-semibold px-3 py-1 rounded-full">
                {sortBy === 'rating' ? 'Top Rated' : sortBy === 'delivery_time' ? 'Fastest' : 'Low Fee'}
              </span>
            )}
            {vegOnly && (
              <span className="bg-green-100 text-green-600 text-xs font-semibold px-3 py-1 rounded-full">
                Veg Only
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Restaurant Grid */}
      <div className="max-w-7xl mx-auto px-6 pb-10 pt-4">
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
          <div className="text-center py-24">
            <p className="text-7xl mb-4">🍽️</p>
            <h3 className="text-xl font-bold text-gray-700 mb-2">
              No restaurants found
            </h3>
            <p className="text-gray-400 mb-6">
              Try adjusting your filters or search term
            </p>
            <button
              onClick={resetFilters}
              className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-xl font-semibold transition-all"
            >
              Clear Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {filtered.map(r => (
              <div
                key={r._id}
                onClick={() => navigate(`/restaurant/${r._id}`)}
                className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-200 cursor-pointer hover:-translate-y-1 group"
              >
                {/* Image */}
                <div className="relative h-44 overflow-hidden">
                  <img
                    src={r.image}
                    alt={r.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  {/* Delivery time badge */}
                  <div className="absolute top-3 left-3 bg-white bg-opacity-90 backdrop-blur-sm text-gray-800 text-xs font-bold px-2.5 py-1 rounded-lg shadow">
                    🕒 {r.deliveryTime} mins
                  </div>
                  {/* Rating badge */}
                  <div className="absolute top-3 right-3 bg-green-500 text-white text-xs font-bold px-2.5 py-1 rounded-lg shadow flex items-center gap-1">
                    ★ {r.rating}
                  </div>
                </div>

                {/* Info */}
                <div className="p-4">
                  <h3 className="text-base font-bold text-gray-800 mb-1 truncate">
                    {r.name}
                  </h3>
                  <p className="text-xs text-gray-500 mb-3 truncate">
                    {r.cuisine.join(', ')}
                  </p>

                  <div className="flex items-center justify-between pt-3 border-t border-gray-50">
                    <span className="text-xs text-gray-500">
                      ₹{r.deliveryFee} delivery
                    </span>
                    <span className="text-xs text-gray-500">
                      Min ₹{r.minOrder}
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