import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

export default function RestaurantDetail() {
  const { id }      = useParams();
  const navigate    = useNavigate();
  const [restaurant, setRestaurant] = useState(null);
  const [loading,    setLoading]    = useState(true);
  const [cart,       setCart]       = useState([]);

  useEffect(() => {
    axios.get(`http://localhost:3000/api/restaurants/${id}`)
      .then(res => {
        setRestaurant(res.data);
        setLoading(false);
      })
      .catch(err => {
        console.log(err);
        setLoading(false);
      });
  }, [id]);

  const addToCart = (item) => {
    setCart(prev => {
      const exists = prev.find(i => i._id === item._id);
      if (exists) {
        return prev.map(i =>
          i._id === item._id ? { ...i, qty: i.qty + 1 } : i
        );
      }
      return [...prev, { ...item, qty: 1 }];
    });
  };

  const removeFromCart = (item) => {
    setCart(prev => {
      const exists = prev.find(i => i._id === item._id);
      if (exists && exists.qty > 1) {
        return prev.map(i =>
          i._id === item._id ? { ...i, qty: i.qty - 1 } : i
        );
      }
      return prev.filter(i => i._id !== item._id);
    });
  };

  const getQty = (itemId) => {
    const found = cart.find(i => i._id === itemId);
    return found ? found.qty : 0;
  };

  const totalItems = cart.reduce((sum, i) => sum + i.qty, 0);
  const totalPrice = cart.reduce((sum, i) => sum + i.price * i.qty, 0);

  const categories = restaurant
    ? [...new Set(restaurant.menu.map(i => i.category))]
    : [];

  if (loading) {
    return (
      <div style={styles.center}>
        <p>Loading menu...</p>
      </div>
    );
  }

  if (!restaurant) {
    return (
      <div style={styles.center}>
        <p>Restaurant not found.</p>
      </div>
    );
  }

  return (
    <div style={styles.container}>

      {/* Navbar */}
      <nav style={styles.navbar}>
        <button onClick={() => navigate('/')} style={styles.backBtn}>
          ← Back
        </button>
        <span style={styles.logo}>swiggy</span>
        <div style={{ width: 80 }} />
      </nav>

      {/* Restaurant Header */}
      <div style={styles.header}>
        <div style={styles.headerInfo}>
          <h1 style={styles.name}>{restaurant.name}</h1>
          <p style={styles.cuisine}>{restaurant.cuisine.join(', ')}</p>
          <p style={styles.address}>{restaurant.address}</p>
          <div style={styles.metaRow}>
            <span style={styles.rating}>★ {restaurant.rating}</span>
            <span style={styles.dot}>•</span>
            <span style={styles.meta}>{restaurant.deliveryTime} mins</span>
            <span style={styles.dot}>•</span>
            <span style={styles.meta}>₹{restaurant.deliveryFee} delivery</span>
          </div>
        </div>
      </div>

      <div style={styles.body}>

        {/* Menu Section */}
        <div style={styles.menuSection}>
          <h2 style={styles.menuTitle}>Menu</h2>

          {categories.map(category => (
            <div key={category} style={styles.categoryBlock}>
              <h3 style={styles.categoryTitle}>{category}</h3>

              {restaurant.menu
                .filter(item => item.category === category)
                .map(item => (
                  <div key={item._id} style={styles.menuItem}>

                    {/* Veg/Non-veg indicator */}
                    <span style={{
                      ...styles.vegBadge,
                      borderColor: item.isVeg ? '#0f8a65' : '#e43b3b',
                    }}>
                      <span style={{
                        ...styles.vegDot,
                        background: item.isVeg ? '#0f8a65' : '#e43b3b',
                      }} />
                    </span>

                    {/* Item Info */}
                    <div style={styles.itemInfo}>
                      <h4 style={styles.itemName}>{item.name}</h4>
                      <p style={styles.itemDesc}>{item.description}</p>
                      <p style={styles.itemPrice}>₹{item.price}</p>
                    </div>

                    {/* Add button */}
                    <div style={styles.addSection}>
                      {getQty(item._id) === 0 ? (
                        <button
                          onClick={() => addToCart(item)}
                          style={styles.addBtn}
                        >
                          ADD
                        </button>
                      ) : (
                        <div style={styles.qtyControl}>
                          <button
                            onClick={() => removeFromCart(item)}
                            style={styles.qtyBtn}
                          >
                            -
                          </button>
                          <span style={styles.qtyNum}>
                            {getQty(item._id)}
                          </span>
                          <button
                            onClick={() => addToCart(item)}
                            style={styles.qtyBtn}
                          >
                            +
                          </button>
                        </div>
                      )}
                    </div>

                  </div>
                ))}
            </div>
          ))}
        </div>

      </div>

      {/* Cart Footer */}
      {totalItems > 0 && (
        <div style={styles.cartBar}>
          <div style={styles.cartLeft}>
            <span style={styles.cartCount}>{totalItems} items</span>
            <span style={styles.cartPrice}>₹{totalPrice}</span>
          </div>
          <button
            style={styles.cartBtn}
            onClick={() => {
              localStorage.setItem('cart', JSON.stringify(cart));
              localStorage.setItem('restaurant', JSON.stringify({
                id: restaurant._id,
                name: restaurant.name,
                deliveryFee: restaurant.deliveryFee,
              }));
              navigate('/cart');
            }}
          >
            View Cart →
          </button>
        </div>
      )}

    </div>
  );
}

const styles = {
  container: { minHeight: '100vh', background: '#f4f4f4', paddingBottom: 100 },
  center: { display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' },
  navbar: {
    background: '#fff',
    padding: '16px 24px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
    position: 'sticky',
    top: 0,
    zIndex: 100,
  },
  backBtn: {
    background: 'none',
    border: 'none',
    fontSize: '16px',
    fontWeight: '600',
    color: '#fc8019',
    cursor: 'pointer',
    width: 80,
  },
  logo: { fontSize: '24px', fontWeight: '800', color: '#fc8019' },
  header: {
    background: '#fff',
    padding: '24px 32px',
    borderBottom: '1px solid #eee',
  },
  headerInfo: {},
  name: { fontSize: '28px', fontWeight: '800', color: '#333', marginBottom: '6px' },
  cuisine: { fontSize: '14px', color: '#888', marginBottom: '4px' },
  address: { fontSize: '13px', color: '#aaa', marginBottom: '10px' },
  metaRow: { display: 'flex', alignItems: 'center', gap: '8px' },
  rating: { color: '#fc8019', fontWeight: '700', fontSize: '15px' },
  dot: { color: '#ccc' },
  meta: { fontSize: '14px', color: '#666' },
  body: { padding: '24px 32px' },
  menuSection: {},
  menuTitle: { fontSize: '22px', fontWeight: '700', color: '#333', marginBottom: '20px' },
  categoryBlock: { marginBottom: '32px' },
  categoryTitle: {
    fontSize: '16px',
    fontWeight: '700',
    color: '#333',
    marginBottom: '16px',
    paddingBottom: '8px',
    borderBottom: '1px solid #eee',
  },
  menuItem: {
    background: '#fff',
    borderRadius: '12px',
    padding: '16px',
    marginBottom: '12px',
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    boxShadow: '0 1px 6px rgba(0,0,0,0.06)',
  },
  vegBadge: {
    width: 18,
    height: 18,
    border: '2px solid',
    borderRadius: '3px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  vegDot: {
    width: 8,
    height: 8,
    borderRadius: '50%',
  },
  itemInfo: { flex: 1 },
  itemName: { fontSize: '15px', fontWeight: '600', color: '#333', marginBottom: '4px' },
  itemDesc: { fontSize: '13px', color: '#888', marginBottom: '6px' },
  itemPrice: { fontSize: '15px', fontWeight: '700', color: '#333' },
  addSection: { flexShrink: 0 },
  addBtn: {
    background: '#fff',
    color: '#fc8019',
    border: '2px solid #fc8019',
    padding: '8px 20px',
    borderRadius: '8px',
    fontWeight: '700',
    fontSize: '14px',
    cursor: 'pointer',
  },
  qtyControl: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    background: '#fc8019',
    borderRadius: '8px',
    padding: '6px 12px',
  },
  qtyBtn: {
    background: 'none',
    border: 'none',
    color: '#fff',
    fontSize: '18px',
    fontWeight: '700',
    cursor: 'pointer',
  },
  qtyNum: { color: '#fff', fontWeight: '700', fontSize: '16px' },
  cartBar: {
    position: 'fixed',
    bottom: 24,
    left: '50%',
    transform: 'translateX(-50%)',
    background: '#fc8019',
    borderRadius: '16px',
    padding: '16px 24px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '90%',
    maxWidth: '500px',
    boxShadow: '0 8px 24px rgba(252,128,25,0.4)',
  },
  cartLeft: { display: 'flex', flexDirection: 'column' },
  cartCount: { color: '#fff', fontSize: '13px', opacity: 0.9 },
  cartPrice: { color: '#fff', fontSize: '18px', fontWeight: '700' },
  cartBtn: {
    background: '#fff',
    color: '#fc8019',
    border: 'none',
    padding: '10px 20px',
    borderRadius: '10px',
    fontWeight: '700',
    fontSize: '15px',
    cursor: 'pointer',
  },
};