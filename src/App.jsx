import { useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Home from './pages/Home';
import Admin from './pages/Admin';
import Auth from './pages/Auth';
import Checkout from './pages/Checkout';
import ProductView from './pages/ProductView';
import MyOrders from './pages/MyOrders';
import AdminOrders from './pages/AdminOrders';
import ForgotPassword from './pages/ForgotPassword'; // 👈 Naya Page Import kiya
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ScrollToTop from './components/ScrollToTop';

// Admin Protection Logic
const AdminRoute = ({ children }) => {
  const { user } = useAuth();
  const adminEmail = import.meta.env.VITE_ADMIN_EMAIL;
  return (user && user.email === adminEmail) ? children : <Navigate to="/" />;
};

export default function App() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");

  return (
    <div className="min-h-screen bg-[#FDFBF7] flex flex-col font-sans">

      {/* 🚀 Page Change par screen ko top pe bhejega */}
      <ScrollToTop />

      {/* 🧭 Navbar */}
      <Navbar searchTerm={searchTerm} setSearchTerm={setSearchTerm} />

      <main className="flex-1">
        <Routes>
          {/* ✅ Home Page */}
          <Route path="/" element={
            <Home
              searchTerm={searchTerm}
              selectedCategory={selectedCategory}
              setSelectedCategory={setSelectedCategory}
            />
          } />

          <Route path="/login" element={<Auth />} />

          {/* ✅ Forgot Password Route (Fix) */}
          <Route path="/forgot-password" element={<ForgotPassword />} />

          <Route path="/checkout" element={<Checkout />} />
          <Route path="/product/:id" element={<ProductView />} />
          <Route path="/my-orders" element={<MyOrders />} />

          {/* Admin Routes */}
          <Route path="/admin" element={
            <AdminRoute>
              <Admin />
            </AdminRoute>
          } />
          <Route path="/admin-orders" element={
            <AdminRoute>
              <AdminOrders />
            </AdminRoute>
          } />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </main>

      {/* 🛋️ Footer */}
      <Footer setSelectedCategory={setSelectedCategory} />

    </div>
  );
}