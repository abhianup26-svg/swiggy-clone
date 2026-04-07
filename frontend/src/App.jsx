import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Home             from './pages/Home';
import Login            from './pages/Login';
import Register         from './pages/Register';
import RestaurantDetail from './pages/RestaurantDetail';
import Cart             from './pages/Cart';
import Orders           from './pages/Orders';
import AdminDashboard   from './pages/admin/AdminDashboard';
import AdminOrders      from './pages/admin/AdminOrders';
import AdminRestaurants from './pages/admin/AdminRestaurants';
import AdminUsers       from './pages/admin/AdminUsers';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/"                    element={<Home />} />
        <Route path="/login"               element={<Login />} />
        <Route path="/register"            element={<Register />} />
        <Route path="/restaurant/:id"      element={<RestaurantDetail />} />
        <Route path="/cart"                element={<Cart />} />
        <Route path="/orders"              element={<Orders />} />
        <Route path="/admin"               element={<AdminDashboard />} />
        <Route path="/admin/orders"        element={<AdminOrders />} />
        <Route path="/admin/restaurants"   element={<AdminRestaurants />} />
        <Route path="/admin/users"         element={<AdminUsers />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;