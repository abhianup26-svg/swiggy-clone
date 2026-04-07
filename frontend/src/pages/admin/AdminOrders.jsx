import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import AdminLayout from '../../components/AdminLayout';
import API_URL from '../../config';

export default function AdminOrders() {
  const navigate = useNavigate();
  const [orders,  setOrders]  = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter,  setFilter]  = useState('All');

  const token = localStorage.getItem('token');

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user'));
    if (!user || user.role !== 'admin') { navigate('/'); return; }

    axios.get(`${API_URL}/api/admin/orders`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => { setOrders(res.data); setLoading(false); })
      .catch(err => { console.log(err); setLoading(false); });
  }, []);

  const updateStatus = async (orderId, status) => {
    try {
      await axios.put(
        `${API_URL}/api/admin/orders/${orderId}/status`,
        { status },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setOrders(prev => prev.map(o =>
        o._id === orderId ? { ...o, status } : o
      ));
    } catch (err) {
      alert('Failed to update status');
    }
  };

  const statuses   = ['All', 'Preparing', 'On the way', 'Delivered'];
  const filtered   = filter === 'All' ? orders : orders.filter(o => o.status === filter);

  const getStatusColor = (status) => {
    if (status === 'Delivered')  return '#10b981';
    if (status === 'On the way') return '#fc8019';
    return '#3b82f6';
  };

  return (
    <AdminLayout>
      <h1 style={styles.pageTitle}>Orders</h1>
      <p style={styles.pageSubtitle}>{orders.length} total orders</p>

      {/* Filter tabs */}
      <div style={styles.filterRow}>
        {statuses.map(s => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            style={{
              ...styles.filterBtn,
              ...(filter === s ? styles.filterBtnActive : {})
            }}
          >
            {s}
          </button>
        ))}
      </div>

      {loading ? (
        <p>Loading orders...</p>
      ) : (
        <div style={styles.ordersList}>
          {filtered.map(order => (
            <div key={order._id} style={styles.orderCard}>
              <div style={styles.orderTop}>
                <div>
                  <h3 style={styles.restaurantName}>{order.restaurantName}</h3>
                  <p style={styles.orderMeta}>
                    {order.user?.name} • {order.user?.email}
                  </p>
                  <p style={styles.orderDate}>
                    {new Date(order.createdAt).toLocaleDateString('en-IN', {
                      day: 'numeric', month: 'short', year: 'numeric',
                      hour: '2-digit', minute: '2-digit'
                    })}
                  </p>
                </div>
                <div style={styles.orderRight}>
                  <p style={styles.orderTotal}>₹{order.total}</p>
                  <select
                    value={order.status}
                    onChange={e => updateStatus(order._id, e.target.value)}
                    style={{
                      ...styles.statusSelect,
                      color: getStatusColor(order.status),
                      borderColor: getStatusColor(order.status),
                    }}
                  >
                    <option value="Preparing">Preparing</option>
                    <option value="On the way">On the way</option>
                    <option value="Delivered">Delivered</option>
                  </select>
                </div>
              </div>

              <div style={styles.itemsList}>
                {order.items.map((item, i) => (
                  <span key={i} style={styles.itemChip}>
                    {item.qty}x {item.name}
                  </span>
                ))}
              </div>

              <p style={styles.address}>📍 {order.address}</p>
            </div>
          ))}
        </div>
      )}
    </AdminLayout>
  );
}

const styles = {
  pageTitle:    { fontSize: '28px', fontWeight: '800', color: '#333', marginBottom: '4px' },
  pageSubtitle: { fontSize: '15px', color: '#888', marginBottom: '24px' },
  filterRow:    { display: 'flex', gap: '8px', marginBottom: '24px', flexWrap: 'wrap' },
  filterBtn: {
    padding: '8px 20px', borderRadius: '20px',
    border: '1.5px solid #e0e0e0', background: '#fff',
    fontSize: '14px', fontWeight: '500',
    cursor: 'pointer', color: '#666',
  },
  filterBtnActive: {
    background: '#fc8019', color: '#fff',
    border: '1.5px solid #fc8019',
  },
  ordersList:  { display: 'flex', flexDirection: 'column', gap: '16px' },
  orderCard: {
    background: '#fff', borderRadius: '16px',
    padding: '20px', boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
  },
  orderTop: {
    display: 'flex', justifyContent: 'space-between',
    alignItems: 'flex-start', marginBottom: '12px',
  },
  restaurantName: { fontSize: '17px', fontWeight: '700', color: '#333', marginBottom: '4px' },
  orderMeta:      { fontSize: '13px', color: '#888', marginBottom: '2px' },
  orderDate:      { fontSize: '12px', color: '#aaa' },
  orderRight:     { display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '8px' },
  orderTotal:     { fontSize: '20px', fontWeight: '800', color: '#333' },
  statusSelect: {
    padding: '6px 12px', borderRadius: '8px',
    border: '1.5px solid', fontSize: '13px',
    fontWeight: '600', cursor: 'pointer',
    outline: 'none', background: '#fff',
  },
  itemsList: { display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '10px' },
  itemChip: {
    background: '#f4f4f4', padding: '4px 12px',
    borderRadius: '20px', fontSize: '13px', color: '#555',
  },
  address: { fontSize: '13px', color: '#888' },
};