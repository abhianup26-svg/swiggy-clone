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
  const [uploading,   setUploading]   = useState(false);
  const [imagePreview, setImagePreview] = useState('');
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

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setImagePreview(URL.createObjectURL(file));
    setUploading(true);

    const formData = new FormData();
    formData.append('image', file);

    try {
      const { data } = await axios.post(
        `${API_URL}/api/upload/image`,
        formData,
        {
          headers: {
            Authorization:  `Bearer ${token}`,
            'Content-Type': 'multipart/form-data',
          }
        }
      );
      setForm(prev => ({ ...prev, image: data.imageUrl }));
    } catch (err) {
      alert('Image upload failed. Try again.');
    } finally {
      setUploading(false);
    }
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
        await axios.put(
          `${API_URL}/api/admin/restaurants/${editingId}`,
          data,
          { headers: { Authorization: `Bearer ${token}` } }
        );
      } else {
        await axios.post(
          `${API_URL}/api/admin/restaurants`,
          data,
          { headers: { Authorization: `Bearer ${token}` } }
        );
      }
      setShowForm(false);
      setEditingId(null);
      setImagePreview('');
      setForm({ name: '', image: '', cuisine: '', rating: '', deliveryTime: '', deliveryFee: '', minOrder: '', address: '' });
      fetchRestaurants();
    } catch (err) {
      alert('Failed to save restaurant');
    }
  };

  const handleEdit = (r) => {
    setForm({
      name:         r.name,
      image:        r.image,
      cuisine:      r.cuisine.join(', '),
      rating:       r.rating,
      deliveryTime: r.deliveryTime,
      deliveryFee:  r.deliveryFee,
      minOrder:     r.minOrder,
      address:      r.address,
    });
    setImagePreview(r.image);
    setEditingId(r._id);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this restaurant?')) return;
    try {
      await axios.delete(
        `${API_URL}/api/admin/restaurants/${id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchRestaurants();
    } catch (err) {
      alert('Failed to delete');
    }
  };

  const resetForm = () => {
    setShowForm(false);
    setEditingId(null);
    setImagePreview('');
    setForm({ name: '', image: '', cuisine: '', rating: '', deliveryTime: '', deliveryFee: '', minOrder: '', address: '' });
  };

  return (
    <AdminLayout>
      <div className="flex justify-between items-start mb-6">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-800">Restaurants</h1>
          <p className="text-gray-500 text-sm mt-1">
            {restaurants.length} restaurants listed
          </p>
        </div>
        <button
          onClick={() => { setShowForm(true); setEditingId(null); }}
          className="bg-orange-500 hover:bg-orange-600 text-white px-5 py-2.5 rounded-xl font-bold text-sm transition-all"
        >
          + Add Restaurant
        </button>
      </div>

      {/* Add/Edit Form */}
      {showForm && (
        <div className="bg-white rounded-2xl shadow-sm p-6 mb-6">
          <h2 className="text-lg font-bold text-gray-800 mb-5">
            {editingId ? 'Edit Restaurant' : 'Add New Restaurant'}
          </h2>

          <form onSubmit={handleSubmit}>

            {/* Image Upload */}
            <div className="mb-6">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Restaurant Image
              </label>
              <div className="flex items-start gap-4">
                {/* Preview */}
                <div className="w-32 h-24 rounded-xl overflow-hidden bg-gray-100 flex-shrink-0">
                  {imagePreview ? (
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400 text-3xl">
                      🏪
                    </div>
                  )}
                </div>

                {/* Upload button */}
                <div className="flex-1">
                  <label className="cursor-pointer">
                    <div className={`border-2 border-dashed rounded-xl p-4 text-center transition-all ${
                      uploading
                        ? 'border-orange-300 bg-orange-50'
                        : 'border-gray-200 hover:border-orange-400 hover:bg-orange-50'
                    }`}>
                      {uploading ? (
                        <p className="text-orange-500 font-medium text-sm">
                          Uploading to Cloudinary...
                        </p>
                      ) : (
                        <>
                          <p className="text-gray-500 text-sm font-medium">
                            Click to upload image
                          </p>
                          <p className="text-gray-400 text-xs mt-1">
                            JPG, PNG, WEBP up to 5MB
                          </p>
                        </>
                      )}
                    </div>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                  </label>
                  {form.image && (
                    <p className="text-green-600 text-xs mt-2 font-medium">
                      ✓ Image uploaded to Cloudinary
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Form fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              {[
                { key: 'name',         label: 'Restaurant Name',           placeholder: 'e.g. Pizza Hut' },
                { key: 'cuisine',      label: 'Cuisine (comma separated)', placeholder: 'Pizza, Italian' },
                { key: 'rating',       label: 'Rating (0-5)',              placeholder: '4.2' },
                { key: 'deliveryTime', label: 'Delivery Time (mins)',      placeholder: '30' },
                { key: 'deliveryFee',  label: 'Delivery Fee (₹)',          placeholder: '40' },
                { key: 'minOrder',     label: 'Min Order (₹)',             placeholder: '150' },
                { key: 'address',      label: 'Address',                   placeholder: 'MG Road, Bengaluru' },
              ].map(field => (
                <div key={field.key}>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    {field.label}
                  </label>
                  <input
                    type="text"
                    placeholder={field.placeholder}
                    value={form[field.key]}
                    onChange={e => setForm(prev => ({ ...prev, [field.key]: e.target.value }))}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 transition-all"
                    required
                  />
                </div>
              ))}
            </div>

            <div className="flex gap-3">
              <button
                type="submit"
                disabled={uploading}
                className="bg-orange-500 hover:bg-orange-600 disabled:bg-orange-300 text-white px-6 py-2.5 rounded-xl font-bold text-sm transition-all"
              >
                {editingId ? 'Update Restaurant' : 'Add Restaurant'}
              </button>
              <button
                type="button"
                onClick={resetForm}
                className="bg-gray-100 hover:bg-gray-200 text-gray-600 px-6 py-2.5 rounded-xl font-bold text-sm transition-all"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Restaurant Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {[1,2,3].map(i => (
            <div key={i} className="bg-white rounded-2xl overflow-hidden animate-pulse">
              <div className="h-36 bg-gray-200" />
              <div className="p-4 space-y-3">
                <div className="h-4 bg-gray-200 rounded w-3/4" />
                <div className="h-3 bg-gray-200 rounded w-1/2" />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {restaurants.map(r => (
            <div
              key={r._id}
              className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="relative h-36 overflow-hidden">
                <img
                  src={r.image}
                  alt={r.name}
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-2 right-2 bg-green-500 text-white text-xs font-bold px-2 py-0.5 rounded-lg">
                  ★ {r.rating}
                </div>
              </div>
              <div className="p-4">
                <h3 className="font-bold text-gray-800 mb-1">{r.name}</h3>
                <p className="text-xs text-gray-500 mb-1">{r.cuisine.join(', ')}</p>
                <p className="text-xs text-gray-400 mb-3">{r.address}</p>
                <div className="flex items-center gap-3 text-xs text-gray-500 mb-4">
                  <span>🕒 {r.deliveryTime} mins</span>
                  <span>₹{r.deliveryFee} delivery</span>
                  <span>Min ₹{r.minOrder}</span>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleEdit(r)}
                    className="flex-1 bg-orange-50 hover:bg-orange-100 text-orange-500 py-2 rounded-lg text-sm font-semibold transition-all"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(r._id)}
                    className="flex-1 bg-red-50 hover:bg-red-100 text-red-500 py-2 rounded-lg text-sm font-semibold transition-all"
                  >
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