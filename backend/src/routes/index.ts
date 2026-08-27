import { Router } from 'express';
import { register, login, getProfile } from '../controllers/auth.controller';
import {
  getProducts,
  getProductById,
  getCategories,
  addProductReview,
} from '../controllers/product.controller';
import {
  createOrder,
  getOrderById,
  getUserOrders,
} from '../controllers/order.controller';
import {
  getPaymentStatus,
  handlePaymentWebhook,
  simulatePaymentSuccess,
} from '../controllers/payment.controller';
import {
  getAdminStats,
  getAdminProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  getAdminOrders,
  updateOrderStatus,
  getSalesReport,
  getAdminReviews,
  deleteAdminReview,
} from '../controllers/admin.controller';
import {
  getConsignments,
  getMakers,
  createMaker,
  updateMaker,
  deleteMaker,
} from '../controllers/consignment.controller';
import { validateCoupon } from '../controllers/coupon.controller';
import { uploadImage } from '../controllers/upload.controller';
import { getStoreSettings, updateStoreSettings } from '../controllers/settings.controller';
import { authenticateJWT, optionalAuthJWT, requireAdmin } from '../middleware/auth.middleware';

const router = Router();

// --- Settings Routes ---
router.get('/settings', getStoreSettings);
router.put('/admin/settings', authenticateJWT, requireAdmin, updateStoreSettings);

// --- Upload Route ---
router.post('/upload', uploadImage);
router.post('/admin/upload', authenticateJWT, requireAdmin, uploadImage);

// --- Auth Routes ---
router.post('/auth/register', register);
router.post('/auth/login', login);
router.get('/auth/me', authenticateJWT, getProfile);

// --- Product & Category Routes ---
router.get('/products', getProducts);
router.get('/products/:id', getProductById);
router.post('/products/:id/reviews', optionalAuthJWT, addProductReview);
router.get('/categories', getCategories);

// --- Coupon Routes ---
router.post('/coupons/validate', validateCoupon);

// --- Consignment Routes ---
router.get('/consignments', getConsignments);
router.get('/consignments/makers', getMakers);

// --- Order Routes ---
router.post('/orders', optionalAuthJWT, createOrder);
router.get('/orders/user/history', authenticateJWT, getUserOrders);
router.get('/orders/:id', getOrderById);

// --- Payment Routes ---
router.get('/payments/:orderId/status', getPaymentStatus);
router.post('/payments/webhook', handlePaymentWebhook);
router.post('/payments/simulate-success', simulatePaymentSuccess);

// --- Admin Protected Routes ---
router.get('/admin/stats', authenticateJWT, requireAdmin, getAdminStats);
router.get('/admin/products', authenticateJWT, requireAdmin, getAdminProducts);
router.post('/admin/products', authenticateJWT, requireAdmin, createProduct);
router.put('/admin/products/:id', authenticateJWT, requireAdmin, updateProduct);
router.delete('/admin/products/:id', authenticateJWT, requireAdmin, deleteProduct);
router.get('/admin/orders', authenticateJWT, requireAdmin, getAdminOrders);
router.put('/admin/orders/:id/status', authenticateJWT, requireAdmin, updateOrderStatus);
router.get('/admin/reports/sales', authenticateJWT, requireAdmin, getSalesReport);
router.get('/admin/consignments/makers', authenticateJWT, requireAdmin, getMakers);
router.post('/admin/consignments/makers', authenticateJWT, requireAdmin, createMaker);
router.put('/admin/consignments/makers/:id', authenticateJWT, requireAdmin, updateMaker);
router.delete('/admin/consignments/makers/:id', authenticateJWT, requireAdmin, deleteMaker);
router.get('/admin/reviews', authenticateJWT, requireAdmin, getAdminReviews);
router.delete('/admin/reviews/:id', authenticateJWT, requireAdmin, deleteAdminReview);

export default router;
