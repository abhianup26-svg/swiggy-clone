import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Home             from './pages/Home';
import Login            from './pages/Login';
import Register         from './pages/Register';
import RestaurantDetail from './pages/RestaurantDetail';
import Cart             from './pages/Cart';
import Orders           from './pages/Orders';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/"               element={<Home />} />
        <Route path="/login"          element={<Login />} />
        <Route path="/register"       element={<Register />} />
        <Route path="/restaurant/:id" element={<RestaurantDetail />} />
        <Route path="/cart"           element={<Cart />} />
        <Route path="/orders"         element={<Orders />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;