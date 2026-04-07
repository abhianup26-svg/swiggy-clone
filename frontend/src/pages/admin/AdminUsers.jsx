import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import AdminLayout from '../../components/AdminLayout';
import API_URL from '../../config';

export default function AdminUsers() {
  const navigate = useNavigate();
  const [users,   setUsers]   = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const user  = JSON.parse(localStorage.getItem('user'));
    const token = localStorage.getItem('token');
    if (!user || user.role !== 'admin') { navigate('/'); return; }

    axios.get(`${API_URL}/api/admin/users`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => { setUsers(res.data); setLoading(false); })
      .catch(err => { console.log(err); setLoading(false); });
  }, []);

  return (
    <AdminLayout>
      <h1 style={styles.pageTitle}>Users</h1>
      <p style={styles.pageSubtitle}>{users.length} registered users</p>

      {loading ? <p>Loading...</p> : (
        <div style={styles.tableCard}>
          <div style={styles.tableHeader}>
            <span style={styles.th}>Name</span>
            <span style={styles.th}>Email</span>
            <span style={styles.th}>Role</span>
            <span style={styles.th}>Joined</span>
          </div>
          {users.map(user => (
            <div key={user._id} style={styles.tableRow}>
              <span style={styles.td}>{user.name}</span>
              <span style={styles.td}>{user.email}</span>
              <span style={{
                ...styles.roleBadge,
                background: user.role === 'admin' ? '#fff3e8' : '#f0f9ff',
                color:      user.role === 'admin' ? '#fc8019' : '#3b82f6',
              }}>
                {user.role}
              </span>
              <span style={styles.td}>
                {new Date(user.createdAt).toLocaleDateString('en-IN', {
                  day: 'numeric', month: 'short', year: 'numeric'
                })}
              </span>
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
  tableCard:    { background: '#fff', borderRadius: '16px', overflow: 'hidden', boxShadow: '0 2px 12px rgba(0,0,0,0.06)' },
  tableHeader:  { display: 'grid', gridTemplateColumns: '1fr 2fr 1fr 1fr', padding: '14px 20px', background: '#f9f9f9' },
  th:           { fontSize: '13px', fontWeight: '600', color: '#888' },
  tableRow:     { display: 'grid', gridTemplateColumns: '1fr 2fr 1fr 1fr', padding: '14px 20px', borderBottom: '1px solid #f0f0f0', alignItems: 'center' },
  td:           { fontSize: '14px', color: '#444' },
  roleBadge:    { padding: '4px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: '600', width: 'fit-content' },
};