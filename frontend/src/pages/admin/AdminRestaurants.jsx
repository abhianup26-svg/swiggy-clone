import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import AdminLayout from '../../components/AdminLayout';
import API_URL from '../../config';

export default function AdminRestaurants() {
  const navigate = useNavigate();
  const [restaurants, setRestaurants] = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [showForm,    setShowForm]    = useState(false);
  const [editingId,   setEditingId]   = useState(null);
  const [form, setForm] = useState({
    name: '', image: '', cuisine: '',
    rating: '', deliveryTime: '',
    deliveryFee: '', minOrder: '', address: '',
  });

  const token = localStorage.getItem('token');

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user'));
    if (!user || user.role !== 'admin') { navigate('/'); return; }
    fetchRestaurants();
  }, []);

  const fetchRestaurants = () => {
    axios.get(`${API_URL}/api/restaurants`)
      .then(res => { setRestaurants(res.data); setLoading(false); })
      .catch(err => { console.log(err); setLoading(false); });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const data = {
      ...form,
      cuisine:      form.cuisine.split(',').map(c => c.trim()),
      rating:       parseFloat(form.rating),
      deliveryTime: parseInt(form.deliveryTime),
      deliveryFee:  parseInt(form.deliveryFee),
      minOrder:     parseInt(form.minOrder),
    };

    try {
      if (editingId) {
        await axios.put(`${API_URL}/api/admin/restaurants/${editingId}`, data, {
          headers: { Authorization: `Bearer ${token}` }
        });
      } else {
        await axios.post(`${API_URL}/api/admin/restaurants`, data, {
          headers: { Authorization: `Bearer ${token}` }
        });
      }
      setShowForm(false);
      setEditingId(null);
      setForm({ name: '', image: '', cuisine: '', rating: '', deliveryTime: '', deliveryFee: '', minOrder: '', address: '' });
      fetchRestaurants();
    } catch (err) {
      alert('Failed to save restaurant');
    }
  };

  const handleEdit = (restaurant) => {
    setForm({
      name:         restaurant.name,
      image:        restaurant.image,
      cuisine:      restaurant.cuisine.join(', '),
      rating:       restaurant.rating,
      deliveryTime: restaurant.deliveryTime,
      deliveryFee:  restaurant.deliveryFee,
      minOrder:     restaurant.minOrder,
      address:      restaurant.address,
    });
    setEditingId(restaurant._id);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this restaurant?')) return;
    try {
      await axios.delete(`${API_URL}/api/admin/restaurants/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchRestaurants();
    } catch (err) {
      alert('Failed to delete');
    }
  };

  return (
    <AdminLayout>
      <div style={styles.header}>
        <div>
          <h1 style={styles.pageTitle}>Restaurants</h1>
          <p style={styles.pageSubtitle}>{restaurants.length} restaurants listed</p>
        </div>
        <button onClick={() => { setShowForm(true); setEditingId(null); }} style={styles.addBtn}>
          + Add Restaurant
        </button>
      </div>

      {/* Add/Edit Form */}
      {showForm && (
        <div style={styles.formCard}>
          <h2 style={styles.formTitle}>
            {editingId ? 'Edit Restaurant' : 'Add New Restaurant'}
          </h2>
          <form onSubmit={handleSubmit} style={styles.form}>
            {[
              { key: 'name',         label: 'Restaurant Name',       placeholder: 'e.g. Pizza Hut' },
              { key: 'image',        label: 'Image URL',             placeholder: 'https://...' },
              { key: 'cuisine',      label: 'Cuisine (comma separated)', placeholder: 'Pizza, Italian' },
              { key: 'rating',       label: 'Rating',                placeholder: '4.2' },
              { key: 'deliveryTime', label: 'Delivery Time (mins)',  placeholder: '30' },
              { key: 'deliveryFee',  label: 'Delivery Fee (₹)',      placeholder: '40' },
              { key: 'minOrder',     label: 'Min Order (₹)',         placeholder: '150' },
              { key: 'address',      label: 'Address',               placeholder: 'MG Road, Bengaluru' },
            ].map(field => (
              <div key={field.key} style={styles.inputGroup}>
                <label style={styles.label}>{field.label}</label>
                <input
                  type="text"
                  placeholder={field.placeholder}
                  value={form[field.key]}
                  onChange={e => setForm(prev => ({ ...prev, [field.key]: e.target.value }))}
                  style={styles.input}
                  required
                />
              </div>
            ))}
            <div style={styles.formButtons}>
              <button type="submit" style={styles.saveBtn}>
                {editingId ? 'Update Restaurant' : 'Add Restaurant'}
              </button>
              <button
                type="button"
                onClick={() => { setShowForm(false); setEditingId(null); }}
                style={styles.cancelBtn}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Restaurant List */}
      {loading ? (
        <p>Loading...</p>
      ) : (
        <div style={styles.grid}>
          {restaurants.map(r => (
            <div key={r._id} style={styles.card}>
              <img src={r.image} alt={r.name} style={styles.cardImg} />
              <div style={styles.cardBody}>
                <h3 style={styles.cardName}>{r.name}</h3>
                <p style={styles.cardCuisine}>{r.cuisine.join(', ')}</p>
                <div style={styles.cardMeta}>
                  <span>★ {r.rating}</span>
                  <span>•</span>
                  <span>{r.deliveryTime} mins</span>
                  <span>•</span>
                  <span>₹{r.deliveryFee}</span>
                </div>
                <p style={styles.cardAddress}>{r.address}</p>
                <div style={styles.cardActions}>
                  <button onClick={() => handleEdit(r)} style={styles.editBtn}>
                    Edit
                  </button>
                  <button onClick={() => handleDelete(r._id)} style={styles.deleteBtn}>
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </AdminLayout>
  );
}

const styles = {
  header:       { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' },
  pageTitle:    { fontSize: '28px', fontWeight: '800', color: '#333', marginBottom: '4px' },
  pageSubtitle: { fontSize: '15px', color: '#888' },
  addBtn: {
    background: '#fc8019', color: '#fff', border: 'none',
    padding: '12px 24px', borderRadius: '10px',
    fontSize: '15px', fontWeight: '700', cursor: 'pointer',
  },
  formCard: {
    background: '#fff', borderRadius: '16px',
    padding: '24px', marginBottom: '24px',
    boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
  },
  formTitle: { fontSize: '18px', fontWeight: '700', color: '#333', marginBottom: '20px' },
  form:      { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' },
  inputGroup:{ display: 'flex', flexDirection: 'column', gap: '6px' },
  label:     { fontSize: '13px', fontWeight: '600', color: '#444' },
  input: {
    padding: '10px 14px', borderRadius: '8px',
    border: '1.5px solid #e0e0e0', fontSize: '14px', outline: 'none',
  },
  formButtons: { gridColumn: '1 / -1', display: 'flex', gap: '12px', marginTop: '8px' },
  saveBtn: {
    background: '#fc8019', color: '#fff', border: 'none',
    padding: '12px 28px', borderRadius: '8px',
    fontSize: '15px', fontWeight: '700', cursor: 'pointer',
  },
  cancelBtn: {
    background: '#f4f4f4', color: '#666', border: 'none',
    padding: '12px 28px', borderRadius: '8px',
    fontSize: '15px', fontWeight: '600', cursor: 'pointer',
  },
  grid:        { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' },
  card:        { background: '#fff', borderRadius: '16px', overflow: 'hidden', boxShadow: '0 2px 12px rgba(0,0,0,0.06)' },
  cardImg:     { width: '100%', height: '140px', objectFit: 'cover' },
  cardBody:    { padding: '16px' },
  cardName:    { fontSize: '16px', fontWeight: '700', color: '#333', marginBottom: '4px' },
  cardCuisine: { fontSize: '13px', color: '#888', marginBottom: '8px' },
  cardMeta:    { display: 'flex', gap: '6px', fontSize: '13px', color: '#666', marginBottom: '6px' },
  cardAddress: { fontSize: '12px', color: '#aaa', marginBottom: '12px' },
  cardActions: { display: 'flex', gap: '8px' },
  editBtn: {
    flex: 1, padding: '8px', background: '#fff3e8',
    color: '#fc8019', border: 'none', borderRadius: '8px',
    fontWeight: '600', fontSize: '13px', cursor: 'pointer',
  },
  deleteBtn: {
    flex: 1, padding: '8px', background: '#fff0f0',
    color: '#e53935', border: 'none', borderRadius: '8px',
    fontWeight: '600', fontSize: '13px', cursor: 'pointer',
  },
};