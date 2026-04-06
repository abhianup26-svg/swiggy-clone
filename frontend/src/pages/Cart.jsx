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

  const increaseQty = (itemId) => setCart(prev => prev.map(i => i._id === itemId ? { ...i, qty: i.qty + 1 } : i));
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
        { restaurantId: restaurant.id, restaurantName: restaurant.name, items: cart.map(i => ({ name: i.name, price: i.price, qty: i.qty })), subtotal, deliveryFee, taxes, total, address },
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
    <div style={styles.successContainer}>
      <div style={styles.successCard}>
        <div style={styles.successIcon}>✓</div>
        <h2 style={styles.successTitle}>Order Placed!</h2>
        <p style={styles.successSub}>Your food is being prepared and will arrive in 30 minutes.</p>
        <button onClick={() => navigate('/')} style={styles.successBtn}>Back to Home</button>
      </div>
    </div>
  );

  if (cart.length === 0) return (
    <div style={styles.emptyContainer}>
      <div style={styles.emptyCard}>
        <p style={styles.emptyIcon}>🛒</p>
        <h2 style={styles.emptyTitle}>Your cart is empty</h2>
        <p style={styles.emptySub}>Add items from a restaurant to get started</p>
        <button onClick={() => navigate('/')} style={styles.emptyBtn}>Browse Restaurants</button>
      </div>
    </div>
  );

  return (
    <div style={styles.container}>
      <nav style={styles.navbar}>
        <button onClick={() => navigate(-1)} style={styles.backBtn}>← Back</button>
        <span style={styles.logo}>swiggy</span>
        <div style={{ width: 80 }} />
      </nav>

      <div style={styles.body}>
        <div style={styles.left}>
          <h2 style={styles.sectionTitle}>Your Cart <span style={styles.itemCount}>({totalItems} items)</span></h2>
          {restaurant && <p style={styles.restaurantName}>From: {restaurant.name}</p>}

          <div style={styles.itemsList}>
            {cart.map(item => (
              <div key={item._id} style={styles.cartItem}>
                <div style={styles.itemInfo}>
                  <h4 style={styles.itemName}>{item.name}</h4>
                  <p style={styles.itemPrice}>₹{item.price} each</p>
                </div>
                <div style={styles.qtyControl}>
                  <button onClick={() => decreaseQty(item._id)} style={styles.qtyBtn}>-</button>
                  <span style={styles.qtyNum}>{item.qty}</span>
                  <button onClick={() => increaseQty(item._id)} style={styles.qtyBtn}>+</button>
                </div>
                <p style={styles.itemTotal}>₹{item.price * item.qty}</p>
              </div>
            ))}
          </div>

          <div style={styles.addressBox}>
            <h3 style={styles.addressTitle}>Delivery Address</h3>
            <textarea
              placeholder="Enter your full delivery address..."
              value={address}
              onChange={e => setAddress(e.target.value)}
              style={styles.addressInput}
              rows={3}
            />
          </div>
        </div>

        <div style={styles.right}>
          <div style={styles.billCard}>
            <h3 style={styles.billTitle}>Bill Summary</h3>
            <div style={styles.billRow}><span style={styles.billLabel}>Subtotal</span><span style={styles.billValue}>₹{subtotal}</span></div>
            <div style={styles.billRow}><span style={styles.billLabel}>Delivery Fee</span><span style={styles.billValue}>₹{deliveryFee}</span></div>
            <div style={styles.billRow}><span style={styles.billLabel}>Taxes (5%)</span><span style={styles.billValue}>₹{taxes}</span></div>
            <div style={styles.billDivider} />
            <div style={styles.billRow}><span style={styles.billTotal}>Total</span><span style={styles.billTotal}>₹{total}</span></div>
            <button onClick={placeOrder} style={loading ? styles.orderBtnDisabled : styles.orderBtn} disabled={loading}>
              {loading ? 'Placing Order...' : `Place Order • ₹${total}`}
            </button>
            <p style={styles.safeText}>Payments coming soon — Cash on Delivery</p>
          </div>
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: { minHeight: '100vh', background: '#f4f4f4' },
  navbar: { background: '#fff', padding: '16px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.06)', position: 'sticky', top: 0, zIndex: 100 },
  backBtn: { background: 'none', border: 'none', fontSize: '16px', fontWeight: '600', color: '#fc8019', cursor: 'pointer', width: 80 },
  logo: { fontSize: '24px', fontWeight: '800', color: '#fc8019' },
  body: { display: 'flex', gap: '24px', padding: '32px', maxWidth: '1100px', margin: '0 auto' },
  left:  { flex: 1 },
  right: { width: '340px', flexShrink: 0 },
  sectionTitle:   { fontSize: '22px', fontWeight: '700', color: '#333', marginBottom: '8px' },
  itemCount:      { fontSize: '16px', color: '#888', fontWeight: '400' },
  restaurantName: { fontSize: '14px', color: '#fc8019', fontWeight: '600', marginBottom: '20px' },
  itemsList:      { marginBottom: '24px' },
  cartItem: { background: '#fff', borderRadius: '12px', padding: '16px', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '16px', boxShadow: '0 1px 6px rgba(0,0,0,0.06)' },
  itemInfo:  { flex: 1 },
  itemName:  { fontSize: '15px', fontWeight: '600', color: '#333', marginBottom: '4px' },
  itemPrice: { fontSize: '13px', color: '#888' },
  qtyControl: { display: 'flex', alignItems: 'center', gap: '12px', background: '#fc8019', borderRadius: '8px', padding: '6px 12px' },
  qtyBtn:    { background: 'none', border: 'none', color: '#fff', fontSize: '18px', fontWeight: '700', cursor: 'pointer' },
  qtyNum:    { color: '#fff', fontWeight: '700', fontSize: '16px' },
  itemTotal: { fontSize: '16px', fontWeight: '700', color: '#333', minWidth: '60px', textAlign: 'right' },
  addressBox:   { background: '#fff', borderRadius: '12px', padding: '20px', boxShadow: '0 1px 6px rgba(0,0,0,0.06)' },
  addressTitle: { fontSize: '16px', fontWeight: '700', color: '#333', marginBottom: '12px' },
  addressInput: { width: '100%', padding: '12px', borderRadius: '8px', border: '1.5px solid #e0e0e0', fontSize: '14px', resize: 'none', outline: 'none', fontFamily: 'inherit' },
  billCard:    { background: '#fff', borderRadius: '16px', padding: '24px', boxShadow: '0 2px 12px rgba(0,0,0,0.08)', position: 'sticky', top: '80px' },
  billTitle:   { fontSize: '18px', fontWeight: '700', color: '#333', marginBottom: '20px' },
  billRow:     { display: 'flex', justifyContent: 'space-between', marginBottom: '12px' },
  billLabel:   { fontSize: '14px', color: '#666' },
  billValue:   { fontSize: '14px', color: '#333', fontWeight: '500' },
  billDivider: { borderTop: '1px dashed #eee', margin: '16px 0' },
  billTotal:   { fontSize: '16px', fontWeight: '700', color: '#333' },
  orderBtn: { width: '100%', padding: '16px', background: '#fc8019', color: '#fff', border: 'none', borderRadius: '12px', fontSize: '16px', fontWeight: '700', marginTop: '20px', cursor: 'pointer' },
  orderBtnDisabled: { width: '100%', padding: '16px', background: '#ffb380', color: '#fff', border: 'none', borderRadius: '12px', fontSize: '16px', fontWeight: '700', marginTop: '20px' },
  safeText: { textAlign: 'center', fontSize: '12px', color: '#aaa', marginTop: '12px' },
  successContainer: { minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f4f4f4' },
  successCard:  { background: '#fff', borderRadius: '20px', padding: '48px', textAlign: 'center', boxShadow: '0 4px 24px rgba(0,0,0,0.08)', maxWidth: '400px', width: '90%' },
  successIcon:  { width: '72px', height: '72px', background: '#fc8019', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '36px', color: '#fff', margin: '0 auto 24px' },
  successTitle: { fontSize: '28px', fontWeight: '800', color: '#333', marginBottom: '12px' },
  successSub:   { fontSize: '15px', color: '#888', marginBottom: '32px' },
  successBtn:   { background: '#fc8019', color: '#fff', border: 'none', padding: '14px 40px', borderRadius: '12px', fontSize: '16px', fontWeight: '700', cursor: 'pointer' },
  emptyContainer: { minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f4f4f4' },
  emptyCard:  { background: '#fff', borderRadius: '20px', padding: '48px', textAlign: 'center', boxShadow: '0 4px 24px rgba(0,0,0,0.08)', maxWidth: '400px', width: '90%' },
  emptyIcon:  { fontSize: '64px', marginBottom: '16px' },
  emptyTitle: { fontSize: '24px', fontWeight: '700', color: '#333', marginBottom: '8px' },
  emptySub:   { fontSize: '14px', color: '#888', marginBottom: '28px' },
  emptyBtn:   { background: '#fc8019', color: '#fff', border: 'none', padding: '14px 32px', borderRadius: '12px', fontSize: '15px', fontWeight: '700', cursor: 'pointer' },
};