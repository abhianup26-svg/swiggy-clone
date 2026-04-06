import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import API_URL from '../config';

export default function Home() {
  const navigate      = useNavigate();
  const user          = JSON.parse(localStorage.getItem('user'));
  const [restaurants, setRestaurants] = useState([]);
  const [loading,     setLoading]     = useState(true);

  useEffect(() => {
    axios.get(`${API_URL}/api/restaurants`)
      .then(res => {
        setRestaurants(res.data);
        setLoading(false);
      })
      .catch(err => {
        console.log(err);
        setLoading(false);
      });
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  return (
    <div style={styles.container}>
      <nav style={styles.navbar}>
        <span style={styles.logo}>swiggy</span>
        <div>
          {user ? (
            <div style={styles.navRight}>
              <span style={styles.welcome}>Hey, {user.name}!</span>
              <button onClick={() => navigate('/orders')} style={styles.ordersBtn}>
                My Orders
              </button>
              <button onClick={handleLogout} style={styles.logoutBtn}>
                Logout
              </button>
            </div>
          ) : (
            <div style={styles.navRight}>
              <button onClick={() => navigate('/login')} style={styles.loginBtn}>
                Login
              </button>
              <button onClick={() => navigate('/register')} style={styles.registerBtn}>
                Sign Up
              </button>
            </div>
          )}
        </div>
      </nav>

      <div style={styles.hero}>
        <h1 style={styles.heroTitle}>Order food you love</h1>
        <p style={styles.heroSub}>Delivery in 30 minutes — Bengaluru</p>
      </div>

      <div style={styles.section}>
        <h2 style={styles.sectionTitle}>Restaurants near you</h2>
        {loading ? (
          <p style={styles.loading}>Loading restaurants...</p>
        ) : (
          <div style={styles.grid}>
            {restaurants.map(r => (
              <div
                key={r._id}
                style={styles.card}
                onClick={() => navigate(`/restaurant/${r._id}`)}
              >
                <div style={styles.imgBox}>
                  <img src={r.image} alt={r.name} style={styles.img} />
                </div>
                <div style={styles.cardBody}>
                  <h3 style={styles.cardName}>{r.name}</h3>
                  <p style={styles.cardCuisine}>{r.cuisine.join(', ')}</p>
                  <div style={styles.cardMeta}>
                    <span style={styles.rating}>★ {r.rating}</span>
                    <span style={styles.dot}>•</span>
                    <span style={styles.metaText}>{r.deliveryTime} mins</span>
                    <span style={styles.dot}>•</span>
                    <span style={styles.metaText}>₹{r.deliveryFee} delivery</span>
                  </div>
                  <p style={styles.minOrder}>Min order: ₹{r.minOrder}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

const styles = {
  container: { minHeight: '100vh', background: '#f4f4f4' },
  navbar: {
    background: '#fff', padding: '16px 40px',
    display: 'flex', justifyContent: 'space-between',
    alignItems: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
    position: 'sticky', top: 0, zIndex: 100,
  },
  logo:     { fontSize: '28px', fontWeight: '800', color: '#fc8019' },
  navRight: { display: 'flex', alignItems: 'center', gap: '16px' },
  welcome:  { fontSize: '15px', fontWeight: '600', color: '#333' },
  ordersBtn: {
    background: 'none', color: '#fc8019',
    border: 'none', fontWeight: '700',
    fontSize: '15px', cursor: 'pointer',
  },
  loginBtn: {
    background: '#fc8019', color: '#fff', border: 'none',
    padding: '10px 24px', borderRadius: '8px',
    fontWeight: '700', fontSize: '15px', cursor: 'pointer',
  },
  registerBtn: {
    background: '#fff', color: '#fc8019',
    border: '2px solid #fc8019', padding: '8px 20px',
    borderRadius: '8px', fontWeight: '700',
    fontSize: '15px', cursor: 'pointer',
  },
  logoutBtn: {
    background: '#fff', color: '#fc8019',
    border: '2px solid #fc8019', padding: '8px 20px',
    borderRadius: '8px', fontWeight: '700',
    fontSize: '14px', cursor: 'pointer',
  },
  hero: {
    background: 'linear-gradient(135deg, #fc8019, #ff6b35)',
    padding: '48px 40px', color: '#fff',
  },
  heroTitle: { fontSize: '36px', fontWeight: '800', marginBottom: '8px' },
  heroSub:   { fontSize: '16px', opacity: 0.9 },
  section:   { padding: '32px 40px' },
  sectionTitle: {
    fontSize: '24px', fontWeight: '700',
    color: '#333', marginBottom: '24px',
  },
  loading: { color: '#888', fontSize: '16px' },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
    gap: '24px',
  },
  card: {
    background: '#fff', borderRadius: '16px',
    overflow: 'hidden', boxShadow: '0 2px 12px rgba(0,0,0,0.08)',
    cursor: 'pointer',
  },
  imgBox:      { width: '100%', height: '160px', overflow: 'hidden' },
  img:         { width: '100%', height: '100%', objectFit: 'cover' },
  cardBody:    { padding: '16px' },
  cardName:    { fontSize: '18px', fontWeight: '700', color: '#333', marginBottom: '4px' },
  cardCuisine: { fontSize: '13px', color: '#888', marginBottom: '10px' },
  cardMeta:    { display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' },
  rating:      { color: '#fc8019', fontWeight: '700', fontSize: '14px' },
  dot:         { color: '#ccc' },
  metaText:    { fontSize: '13px', color: '#666' },
  minOrder:    { fontSize: '12px', color: '#aaa' },
};