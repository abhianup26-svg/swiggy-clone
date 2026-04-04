import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

export default function Orders() {
  const navigate = useNavigate();
  const [orders,  setOrders]  = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }

    axios.get('http://localhost:3000/api/orders/mine', {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => {
        setOrders(res.data);
        setLoading(false);
      })
      .catch(err => {
        console.log(err);
        setLoading(false);
      });
  }, []);

  const getStatusColor = (status) => {
    if (status === 'Delivered')  return '#0f8a65';
    if (status === 'On the way') return '#fc8019';
    return '#3b82f6';
  };

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-IN', {
      day:   'numeric',
      month: 'short',
      year:  'numeric',
      hour:  '2-digit',
      minute:'2-digit',
    });
  };

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

      <div style={styles.body}>
        <h2 style={styles.pageTitle}>Your Orders</h2>

        {loading ? (
          <p style={styles.loading}>Loading your orders...</p>
        ) : orders.length === 0 ? (
          <div style={styles.emptyCard}>
            <p style={styles.emptyIcon}>📦</p>
            <h3 style={styles.emptyTitle}>No orders yet!</h3>
            <p style={styles.emptySub}>
              Your order history will appear here
            </p>
            <button
              onClick={() => navigate('/')}
              style={styles.browseBtn}
            >
              Order Now
            </button>
          </div>
        ) : (
          <div style={styles.ordersList}>
            {orders.map(order => (
              <div key={order._id} style={styles.orderCard}>

                {/* Order Header */}
                <div style={styles.orderHeader}>
                  <div>
                    <h3 style={styles.restaurantName}>
                      {order.restaurantName}
                    </h3>
                    <p style={styles.orderDate}>
                      {formatDate(order.createdAt)}
                    </p>
                  </div>
                  <span style={{
                    ...styles.statusBadge,
                    background: getStatusColor(order.status) + '15',
                    color:      getStatusColor(order.status),
                    border:     `1px solid ${getStatusColor(order.status)}40`,
                  }}>
                    {order.status}
                  </span>
                </div>

                {/* Order Items */}
                <div style={styles.itemsList}>
                  {order.items.map((item, index) => (
                    <div key={index} style={styles.orderItem}>
                      <span style={styles.itemQty}>
                        {item.qty}x
                      </span>
                      <span style={styles.itemName}>
                        {item.name}
                      </span>
                      <span style={styles.itemPrice}>
                        ₹{item.price * item.qty}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Order Footer */}
                <div style={styles.orderFooter}>
                  <div style={styles.billBreakup}>
                    <span style={styles.billSmall}>
                      Subtotal: ₹{order.subtotal}
                    </span>
                    <span style={styles.billSmall}>
                      Delivery: ₹{order.deliveryFee}
                    </span>
                    <span style={styles.billSmall}>
                      Taxes: ₹{order.taxes}
                    </span>
                  </div>
                  <div style={styles.totalBox}>
                    <span style={styles.totalLabel}>Total Paid</span>
                    <span style={styles.totalAmount}>₹{order.total}</span>
                  </div>
                </div>

                {/* Delivery Address */}
                <div style={styles.addressBox}>
                  <span style={styles.addressLabel}>
                    Delivered to:
                  </span>
                  <span style={styles.addressText}>
                    {order.address}
                  </span>
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
    background: 'none', border: 'none',
    fontSize: '16px', fontWeight: '600',
    color: '#fc8019', cursor: 'pointer', width: 80,
  },
  logo: { fontSize: '24px', fontWeight: '800', color: '#fc8019' },
  body: {
    maxWidth: '800px',
    margin: '0 auto',
    padding: '32px 24px',
  },
  pageTitle: {
    fontSize: '28px', fontWeight: '800',
    color: '#333', marginBottom: '24px',
  },
  loading: { color: '#888', fontSize: '16px' },
  emptyCard: {
    background: '#fff',
    borderRadius: '20px',
    padding: '48px',
    textAlign: 'center',
    boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
  },
  emptyIcon:  { fontSize: '64px', marginBottom: '16px' },
  emptyTitle: { fontSize: '22px', fontWeight: '700', color: '#333', marginBottom: '8px' },
  emptySub:   { fontSize: '14px', color: '#888', marginBottom: '28px' },
  browseBtn: {
    background: '#fc8019', color: '#fff',
    border: 'none', padding: '14px 32px',
    borderRadius: '12px', fontSize: '15px',
    fontWeight: '700', cursor: 'pointer',
  },
  ordersList: { display: 'flex', flexDirection: 'column', gap: '20px' },
  orderCard: {
    background: '#fff',
    borderRadius: '16px',
    padding: '24px',
    boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
  },
  orderHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '16px',
    paddingBottom: '16px',
    borderBottom: '1px solid #f0f0f0',
  },
  restaurantName: {
    fontSize: '18px', fontWeight: '700',
    color: '#333', marginBottom: '4px',
  },
  orderDate: { fontSize: '13px', color: '#aaa' },
  statusBadge: {
    padding: '6px 14px',
    borderRadius: '20px',
    fontSize: '13px',
    fontWeight: '600',
  },
  itemsList: {
    marginBottom: '16px',
    paddingBottom: '16px',
    borderBottom: '1px solid #f0f0f0',
  },
  orderItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    marginBottom: '8px',
  },
  itemQty: {
    background: '#fff3e8',
    color: '#fc8019',
    fontWeight: '700',
    fontSize: '13px',
    padding: '2px 8px',
    borderRadius: '6px',
  },
  itemName:  { flex: 1, fontSize: '14px', color: '#444' },
  itemPrice: { fontSize: '14px', fontWeight: '600', color: '#333' },
  orderFooter: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '12px',
  },
  billBreakup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
  },
  billSmall: { fontSize: '12px', color: '#aaa' },
  totalBox: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-end',
  },
  totalLabel:  { fontSize: '12px', color: '#888', marginBottom: '2px' },
  totalAmount: { fontSize: '20px', fontWeight: '800', color: '#fc8019' },
  addressBox: {
    background: '#f9f9f9',
    borderRadius: '8px',
    padding: '10px 14px',
    display: 'flex',
    gap: '8px',
    alignItems: 'flex-start',
  },
  addressLabel: { fontSize: '12px', color: '#aaa', fontWeight: '600', flexShrink: 0 },
  addressText:  { fontSize: '13px', color: '#666' },
};