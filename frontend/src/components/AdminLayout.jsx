import { useNavigate, useLocation } from 'react-router-dom';

export default function AdminLayout({ children }) {
  const navigate = useNavigate();
  const location = useLocation();

  const menuItems = [
    { label: 'Dashboard',   path: '/admin' },
    { label: 'Restaurants', path: '/admin/restaurants' },
    { label: 'Orders',      path: '/admin/orders' },
    { label: 'Users',       path: '/admin/users' },
  ];

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  return (
    <div style={styles.container}>

      {/* Sidebar */}
      <div style={styles.sidebar}>
        <div style={styles.sidebarLogo}>
          <span style={styles.logoText}>swiggy</span>
          <span style={styles.adminBadge}>ADMIN</span>
        </div>

        <nav style={styles.nav}>
          {menuItems.map(item => (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              style={{
                ...styles.navItem,
                ...(location.pathname === item.path ? styles.navItemActive : {})
              }}
            >
              {item.label}
            </button>
          ))}
        </nav>

        <button onClick={handleLogout} style={styles.logoutBtn}>
          Logout
        </button>
      </div>

      {/* Main Content */}
      <div style={styles.main}>
        {children}
      </div>

    </div>
  );
}

const styles = {
  container: {
    display: 'flex',
    minHeight: '100vh',
    background: '#f4f4f4',
  },
  sidebar: {
    width: '240px',
    background: '#1a1a2e',
    display: 'flex',
    flexDirection: 'column',
    padding: '24px 0',
    flexShrink: 0,
    position: 'sticky',
    top: 0,
    height: '100vh',
  },
  sidebarLogo: {
    padding: '0 24px 32px',
    borderBottom: '1px solid rgba(255,255,255,0.1)',
    marginBottom: '16px',
  },
  logoText: {
    fontSize: '24px',
    fontWeight: '800',
    color: '#fc8019',
    display: 'block',
  },
  adminBadge: {
    fontSize: '10px',
    fontWeight: '700',
    color: 'rgba(255,255,255,0.4)',
    letterSpacing: '2px',
  },
  nav: {
    flex: 1,
    padding: '0 12px',
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
  },
  navItem: {
    background: 'none',
    border: 'none',
    color: 'rgba(255,255,255,0.6)',
    padding: '12px 16px',
    borderRadius: '8px',
    textAlign: 'left',
    fontSize: '15px',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
  navItemActive: {
    background: '#fc8019',
    color: '#fff',
  },
  logoutBtn: {
    margin: '0 12px',
    background: 'rgba(255,255,255,0.1)',
    border: 'none',
    color: 'rgba(255,255,255,0.6)',
    padding: '12px 16px',
    borderRadius: '8px',
    textAlign: 'left',
    fontSize: '15px',
    cursor: 'pointer',
  },
  main: {
    flex: 1,
    padding: '32px',
    overflowY: 'auto',
  },
};