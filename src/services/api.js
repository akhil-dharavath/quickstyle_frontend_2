import axios from 'axios';
import { logger } from '../utils/logger';
import { store } from '../redux/store';
import { logout } from '../redux/slices/authSlice';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

const api = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use(
  (config) => {
    logger.debug(`API Req [${config.method.toUpperCase()}] ${config.url}`, config.params || '');
    const user = JSON.parse(localStorage.getItem('user'));
    if (user?.token) {
      config.headers.Authorization = `Bearer ${user.token}`;
    }
    return config;
  },
  (error) => {
    logger.error('API Request Error:', error);
    return Promise.reject(error);
  }
);

// Normalize all errors into plain Error objects with .message populated
api.interceptors.response.use(
  (response) => {
    logger.debug(`API Res [${response.status}] ${response.config.url}`);

    // Auto-unwrap the backend's standard { success, data, error } envelope
    if (response.data && typeof response.data === 'object' && response.data.success !== undefined) {
      if (response.data.success) {
        return { ...response, data: response.data.data };
      }
    }

    return response;
  },
  (error) => {
    let errorMessage = 'An unexpected error occurred';

    // Standardized Error Parsing
    if (error.response?.data?.error?.message) {
      errorMessage = error.response.data.error.message;
    } else if (error.response?.data?.message) {
      errorMessage = error.response.data.message; // Legacy fallback
    } else if (error.message) {
      errorMessage = error.message;
    }

    logger.error(`API Error [${error.response?.status}] ${error.config?.url}:`, errorMessage);
    const normalizedError = new Error(errorMessage);
    normalizedError.status = error.response?.status;
    normalizedError.code = error.response?.data?.error?.code || 'UNKNOWN';
    normalizedError.originalError = error;

    // Handle Token Expiry
    if (normalizedError.status === 401 && !error.config?.url?.includes('/auth/login')) {
      logger.error('Unauthorized Access - Token Expired or Invalid. Logging out.');
      store.dispatch(logout());
    }

    return Promise.reject(normalizedError);
  }
);

const apiService = {
  // Auth
  register: (userData) => api.post('/auth/register', userData),
  sendRegistrationOtp: (email) => api.post('/auth/send-otp', { email }),
  registerWithOtp: (userData) => api.post('/auth/register-otp', userData),
  login: (email, password) => api.post('/auth/login', { email, password }),
  googleLogin: (credential) => api.post('/auth/google', { credential }),
  inviteUser: (data) => api.post('/auth/invite', data),
  setPasswordFromInvite: (token, password) => api.post('/auth/set-password', { token, password }),
  updateProfile: (data) => api.put('/auth/profile', data),
  requestEmailOtp: (data) => api.post('/auth/profile/email/request-otp', data),
  verifyEmailOtp: (data) => api.post('/auth/profile/email/verify', data),
  requestPhoneOtp: (data) => api.post('/auth/profile/phone/request-otp', data),
  verifyPhoneOtp: (data) => api.post('/auth/profile/phone/verify', data),

  // Shops
  getShops: (params) => api.get('/shops', { params }),
  getShopById: (id) => api.get(`/shops/${id}`),
  createShop: (data) => api.post('/shops', data),
  getMyShop: () => api.get('/shops/my-shop'),
  updateMyShop: (data) => api.put('/shops/my-shop', data),

  // Products
  getProducts: (params) => api.get('/products', { params }),
  getProductById: (id) => api.get(`/products/${id}`),
  createProduct: (data) => api.post('/products', data),
  updateProduct: (id, data) => api.put(`/products/${id}`, data),
  deleteProduct: (id) => api.delete(`/products/${id}`),

  // Orders — customer
  createOrder: (data) => api.post('/orders', data),
  getOrders: () => api.get('/orders/myorders'),
  getShopOrders: () => api.get('/orders/shop-orders'),
  getOrder: (id) => api.get(`/orders/${id}`),
  requestReplacement: (orderId, itemId) => api.post(`/orders/${orderId}/replace/${itemId}`),
  updateOrderStatusBySeller: (orderId, status) => api.put(`/orders/${orderId}/status`, { status }),
  cancelOrder: (id) => api.put(`/orders/${id}/cancel`),

  // Admin
  getAdminSettings: () => api.get('/admin/settings'),
  updateAdminSettings: (data) => api.put('/admin/settings', data),
  getPendingProducts: () => api.get('/admin/pending-products'),
  approveProduct: (id, status) => api.put(`/admin/products/${id}/approve`, { status }),
  getUsers: () => api.get('/admin/users'),
  toggleUserStatus: (id) => api.put(`/admin/users/${id}/status`),
  deleteUser: (id) => api.delete(`/admin/users/${id}`),
  getDashboardStats: () => api.get('/admin/dashboard'),
  // FIX: Admin orders page now has its own endpoint that populates customer/shop names
  getAdminOrders: () => api.get('/admin/orders'),
  getActiveDeliveries: () => api.get('/admin/active-deliveries'),
  getDeliveryPersons: () => api.get('/admin/delivery-persons'),
  deleteDeliveryPerson: (id) => api.delete(`/admin/delivery-persons/${id}`),

  // Payment
  getRazorpayKey: () => api.get('/payment/key'),
  createPaymentOrder: (data) => api.post('/payment/create-order', data),
  verifyPayment: (data) => api.post('/payment/verify', data),

  // Delivery
  updateDeliveryLocation: (data) => api.put('/delivery/location', data),
  toggleDeliveryAvailability: (data) => api.put('/delivery/status', data),
  getAssignedOrders: () => api.get('/delivery/orders'),
  getAvailablePickups: () => api.get('/delivery/available-orders'),
  // FIX: New endpoints added in audit fixes
  getDeliveryHistory: () => api.get('/delivery/history'),
  claimDeliveryOrder: (orderId) => api.put(`/delivery/order/${orderId}/claim`),
  updateDeliveryStatus: (id, data) => api.put(`/delivery/order/${id}/status`, data),

  // Image Upload (AWS S3)
  uploadImage: (file) => {
    const formData = new FormData();
    formData.append('image', file);
    return api.post('/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  uploadMultipleImages: (files) => {
    const formData = new FormData();
    files.forEach((file) => formData.append('images', file));
    return api.post('/upload/multiple', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
};

export default apiService;
