import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import AdminLayout from '../../components/AdminLayout';
import API_URL from '../../config';

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [stats,   setStats]   = useState(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState('');

  useEffect(() => {
    const user  = JSON.parse(localStorage.getItem('user'));
    const token = localStorage.getItem('token');

    if (!user || !token) {
      navigate('/login');
      return;
    }

    if (user.role !== 'admin') {
      navigate('/');
      return;
    }

    axios.get(`${API_URL}/api/admin/stats`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => {
        setStats(res.data);
        setLoading(false);
      })
      .catch(err => {
        setError(err.response?.data?.message || 'Failed to load stats');
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <AdminLayout>
        <p style={{ color: '#888', fontSize: '16px' }}>Loading dashboard...</p>
      </AdminLayout>
    );
  }

  if (error) {
    return (
      <AdminLayout>
        <p style={{ color: 'red' }}>{error}</p>
      </AdminLayout>
    );
  }

  const statCards = [
    { label: 'Total Users',       value: stats.totalUsers,         color: '#3b82f6' },
    { label: 'Total Restaurants', value: stats.totalRestaurants,   color: '#fc8019' },
    { label: 'Total Orders',      value: stats.totalOrders,        color: '#8b5cf6' },
    { label: 'Total Revenue',     value: `₹${stats.totalRevenue}`, color: '#10b981' },
  ];

  const getStatusColor = (status) => {
    if (status === 'Delivered')  return '#10b981';
    if (status === 'On the way') return '#fc8019';
    return '#3b82f6';
  };

  return (
    <AdminLayout>
      <h1 style={styles.pageTitle}>Dashboard</h1>
      <p style={styles.pageSubtitle}>Welcome back, Admin!</p>

      <div style={styles.statsGrid}>
        {statCards.map(card => (
          <div key={card.label} style={styles.statCard}>
            <div style={{ ...styles.statIcon, background: card.color + '20' }}>
              <div style={{ ...styles.statDot, background: card.color }} />
            </div>
            <div>
              <p style={styles.statLabel}>{card.label}</p>
              <p style={{ ...styles.statValue, color: card.color }}>
                {card.value}
              </p>
            </div>
          </div>
        ))}
      </div>

      <div style={styles.section}>
        <div style={styles.sectionHeader}>
          <h2 style={styles.sectionTitle}>Recent Orders</h2>
          <button
            onClick={() => navigate('/admin/orders')}
            style={styles.viewAllBtn}
          >
            View All
          </button>
        </div>

        {stats.recentOrders.length === 0 ? (
          <p style={{ color: '#888' }}>No orders yet.</p>
        ) : (
          <div style={styles.table}>
            <div style={styles.tableHeader}>
              <span style={styles.th}>Restaurant</span>
              <span style={styles.th}>Amount</span>
              <span style={styles.th}>Status</span>
              <span style={styles.th}>Date</span>
            </div>
            {stats.recentOrders.map(order => (
              <div key={order._id} style={styles.tableRow}>
                <span style={styles.td}>{order.restaurantName}</span>
                <span style={styles.td}>₹{order.total}</span>
                <span style={{
                  ...styles.statusBadge,
                  background: getStatusColor(order.status) + '15',
                  color:      getStatusColor(order.status),
                }}>
                  {order.status}
                </span>
                <span style={styles.td}>
                  {new Date(order.createdAt).toLocaleDateString('en-IN')}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </AdminLayout>
  );
}

const styles = {
  pageTitle:    { fontSize: '28px', fontWeight: '800', color: '#333', marginBottom: '4px' },
  pageSubtitle: { fontSize: '15px', color: '#888', marginBottom: '32px' },
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
    gap: '20px',
    marginBottom: '32px',
  },
  statCard: {
    background: '#fff',
    borderRadius: '16px',
    padding: '24px',
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
  },
  statIcon: {
    width: '48px', height: '48px',
    borderRadius: '12px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  statDot:   { width: '16px', height: '16px', borderRadius: '50%' },
  statLabel: { fontSize: '13px', color: '#888', marginBottom: '4px' },
  statValue: { fontSize: '24px', fontWeight: '800' },
  section: {
    background: '#fff',
    borderRadius: '16px',
    padding: '24px',
    boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
  },
  sectionHeader: {
    display: 'flex', justifyContent: 'space-between',
    alignItems: 'center', marginBottom: '20px',
  },
  sectionTitle: { fontSize: '18px', fontWeight: '700', color: '#333' },
  viewAllBtn: {
    background: '#fff3e8', color: '#fc8019',
    border: 'none', padding: '8px 16px',
    borderRadius: '8px', fontWeight: '600',
    fontSize: '14px', cursor: 'pointer',
  },
  table:       { width: '100%' },
  tableHeader: {
    display: 'grid',
    gridTemplateColumns: '2fr 1fr 1fr 1fr',
    padding: '12px 16px',
    background: '#f9f9f9',
    borderRadius: '8px',
    marginBottom: '8px',
  },
  th: { fontSize: '13px', fontWeight: '600', color: '#888' },
  tableRow: {
    display: 'grid',
    gridTemplateColumns: '2fr 1fr 1fr 1fr',
    padding: '14px 16px',
    borderBottom: '1px solid #f0f0f0',
    alignItems: 'center',
  },
  td:          { fontSize: '14px', color: '#444' },
  statusBadge: {
    padding: '4px 10px', borderRadius: '20px',
    fontSize: '12px', fontWeight: '600', width: 'fit-content',
  },
};