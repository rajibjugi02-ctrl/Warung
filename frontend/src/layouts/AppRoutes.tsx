import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Navbar from '../components/common/Navbar';
import Footer from '../components/common/Footer';
import MobileBottomNav from '../components/common/MobileBottomNav';
import ScrollToTop from '../components/common/ScrollToTop';
import HomePage from '../pages/HomePage';
import ProductsPage from '../pages/ProductsPage';
import ProductDetailPage from '../pages/ProductDetailPage';
import CartPage from '../pages/CartPage';
import CheckoutPage from '../pages/CheckoutPage';
import PaymentPage from '../pages/PaymentPage';
import OrderTrackingPage from '../pages/OrderTrackingPage';
import ConsignmentPage from '../pages/ConsignmentPage';
import AuthPage from '../pages/AuthPage';
import AboutPage from '../pages/AboutPage';
import ContactPage from '../pages/ContactPage';
import AdminDashboardPage from '../pages/admin/AdminDashboardPage';
import AdminProductsPage from '../pages/admin/AdminProductsPage';
import AdminConsignmentPage from '../pages/admin/AdminConsignmentPage';
import AdminBannerSettingsPage from '../pages/admin/AdminBannerSettingsPage';
import AdminPaymentSettingsPage from '../pages/admin/AdminPaymentSettingsPage';
import AdminReviewsPage from '../pages/admin/AdminReviewsPage';
import AdminOrdersPage from '../pages/admin/AdminOrdersPage';
import AdminReportsPage from '../pages/admin/AdminReportsPage';
import { useAuth } from '../contexts/AuthContext';

// Protected Admin Route
const AdminRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (!user || user.role !== 'ADMIN') {
    return <Navigate to="/login" replace />;
  }
  return <>{children}</>;
};

const MainLayout: React.FC = () => (
  <div className="flex flex-col min-h-screen">
    <Navbar />
    <main className="flex-1">
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/jajanan" element={<ProductsPage snackOnly />} />
        <Route path="/produk" element={<ProductsPage />} />
        <Route path="/produk/:id" element={<ProductDetailPage />} />
        <Route path="/penitipan" element={<ConsignmentPage />} />
        <Route path="/keranjang" element={<CartPage />} />
        <Route path="/checkout" element={<CheckoutPage />} />
        <Route path="/payment/:orderId" element={<PaymentPage />} />
        <Route path="/pesanan/:id" element={<OrderTrackingPage />} />
        <Route path="/pesanan/track" element={<OrderTrackingPage />} />
        <Route path="/login" element={<AuthPage mode="login" />} />
        <Route path="/register" element={<AuthPage mode="register" />} />
        <Route path="/tentang" element={<AboutPage />} />
        <Route path="/kontak" element={<ContactPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </main>
    <Footer />
    <MobileBottomNav />
  </div>
);

const AppRoutes: React.FC = () => {
  return (
    <>
      <ScrollToTop />
      <Routes>
        {/* Admin routes without main layout */}
        <Route
          path="/admin"
          element={
            <AdminRoute>
              <AdminDashboardPage />
            </AdminRoute>
          }
        />
        <Route
          path="/admin/produk"
          element={
            <AdminRoute>
              <AdminProductsPage />
            </AdminRoute>
          }
        />
        <Route
          path="/admin/titip"
          element={
            <AdminRoute>
              <AdminConsignmentPage />
            </AdminRoute>
          }
        />
        <Route
          path="/admin/banner"
          element={
            <AdminRoute>
              <AdminBannerSettingsPage />
            </AdminRoute>
          }
        />
        <Route
          path="/admin/pembayaran"
          element={
            <AdminRoute>
              <AdminPaymentSettingsPage />
            </AdminRoute>
          }
        />
        <Route
          path="/admin/ulasan"
          element={
            <AdminRoute>
              <AdminReviewsPage />
            </AdminRoute>
          }
        />
        <Route
          path="/admin/pesanan"
          element={
            <AdminRoute>
              <AdminOrdersPage />
            </AdminRoute>
          }
        />
        <Route
          path="/admin/laporan"
          element={
            <AdminRoute>
              <AdminReportsPage />
            </AdminRoute>
          }
        />

        {/* Main routes */}
        <Route path="/*" element={<MainLayout />} />
      </Routes>
    </>
  );
};

export default AppRoutes;
