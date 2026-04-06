import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import API_URL from '../config';

export default function Register() {
  const [name,     setName]     = useState('');
  const [email,    setEmail]    = useState('');
  const [password, setPassword] = useState('');
  const [error,    setError]    = useState('');
  const [loading,  setLoading]  = useState(false);
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await axios.post(`${API_URL}/api/auth/register`, {
        name,
        email,
        password
      });
      navigate('/login');
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <div style={styles.logo}>
          <span style={styles.logoText}>swiggy</span>
        </div>
        <h2 style={styles.title}>Create your account</h2>
        <p style={styles.subtitle}>Order food from your favourite restaurants</p>

        {error && <div style={styles.error}>{error}</div>}

        <form onSubmit={handleRegister}>
          <div style={styles.inputGroup}>
            <label style={styles.label}>Full Name</label>
            <input
              type="text"
              placeholder="Enter your full name"
              value={name}
              onChange={e => setName(e.target.value)}
              style={styles.input}
              required
            />
          </div>
          <div style={styles.inputGroup}>
            <label style={styles.label}>Email</label>
            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              style={styles.input}
              required
            />
          </div>
          <div style={styles.inputGroup}>
            <label style={styles.label}>Password</label>
            <input
              type="password"
              placeholder="Minimum 6 characters"
              value={password}
              onChange={e => setPassword(e.target.value)}
              style={styles.input}
              required
              minLength={6}
            />
          </div>
          <button
            type="submit"
            style={loading ? styles.buttonDisabled : styles.button}
            disabled={loading}
          >
            {loading ? 'Creating account...' : 'Create Account'}
          </button>
        </form>

        <p style={styles.switchText}>
          Already have an account?{' '}
          <Link to="/login" style={styles.link}>Login</Link>
        </p>
      </div>
    </div>
  );
}

const styles = {
  container: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: '#f4f4f4',
  },
  card: {
    background: '#fff',
    padding: '40px',
    borderRadius: '16px',
    width: '100%',
    maxWidth: '420px',
    boxShadow: '0 4px 24px rgba(0,0,0,0.08)',
  },
  logo:     { textAlign: 'center', marginBottom: '24px' },
  logoText: { fontSize: '32px', fontWeight: '800', color: '#fc8019', letterSpacing: '-1px' },
  title:    { fontSize: '22px', fontWeight: '700', textAlign: 'center', marginBottom: '8px' },
  subtitle: { fontSize: '14px', color: '#888', textAlign: 'center', marginBottom: '28px' },
  error: {
    background: '#fff0f0', color: '#e53935',
    padding: '12px', borderRadius: '8px',
    marginBottom: '16px', fontSize: '14px', textAlign: 'center',
  },
  inputGroup: { marginBottom: '16px' },
  label: {
    display: 'block', fontSize: '14px',
    fontWeight: '600', marginBottom: '6px', color: '#444',
  },
  input: {
    width: '100%', padding: '12px 16px',
    borderRadius: '8px', border: '1.5px solid #e0e0e0',
    fontSize: '15px', outline: 'none',
  },
  button: {
    width: '100%', padding: '14px',
    background: '#fc8019', color: '#fff',
    border: 'none', borderRadius: '8px',
    fontSize: '16px', fontWeight: '700', marginTop: '8px',
  },
  buttonDisabled: {
    width: '100%', padding: '14px',
    background: '#ffb380', color: '#fff',
    border: 'none', borderRadius: '8px',
    fontSize: '16px', fontWeight: '700', marginTop: '8px',
  },
  switchText: { textAlign: 'center', marginTop: '24px', fontSize: '14px', color: '#666' },
  link: { color: '#fc8019', fontWeight: '700', textDecoration: 'none' },
};