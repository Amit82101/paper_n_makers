import axios from 'axios';

export const API = process.env.REACT_APP_BACKEND_URL;


export const ENDPOINTS = {
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
  },
  PRODUCTS: {
    LIST: '/products',
    BY_ID: (id) => `/products/${id}`,
  },
  CART: '/cart',
  ORDERS: {
    LIST: '/orders',
    CREATE: '/orders/create',
    BY_ID: (id) => `/orders/${id}`,
    STATUS: (id) => `/orders/${id}/status`,
    VERIFY_PAYMENT: '/orders/verify-payment',
  },
  RAZORPAY_KEY: '/razorpay-key',
};

const buildUrl = (path) => `${API}${path}`;

export const authService = {
  login: (email, password) =>
    axios.post(buildUrl(ENDPOINTS.AUTH.LOGIN), { email, password }),

  register: (name, email, password, phone) =>
    axios.post(buildUrl(ENDPOINTS.AUTH.REGISTER), { name, email, password, phone }),
};

export const productService = {
  getAll: (params) =>
    axios.get(buildUrl(ENDPOINTS.PRODUCTS.LIST), { params }),

  getById: (id) =>
    axios.get(buildUrl(ENDPOINTS.PRODUCTS.BY_ID(id))),

  create: (productData) =>
    axios.post(buildUrl(ENDPOINTS.PRODUCTS.LIST), productData),

  update: (id, productData) =>
    axios.put(buildUrl(ENDPOINTS.PRODUCTS.BY_ID(id)), productData),

  delete: (id) =>
    axios.delete(buildUrl(ENDPOINTS.PRODUCTS.BY_ID(id))),
};

export const cartService = {
  get: () =>
    axios.get(buildUrl(ENDPOINTS.CART)),

  update: (items) =>
    axios.post(buildUrl(ENDPOINTS.CART), items),
};

export const orderService = {
  getAll: () =>
    axios.get(buildUrl(ENDPOINTS.ORDERS.LIST)),

  getById: (id) =>
    axios.get(buildUrl(ENDPOINTS.ORDERS.BY_ID(id))),

  create: (orderData) =>
    axios.post(buildUrl(ENDPOINTS.ORDERS.CREATE), orderData),

  updateStatus: (id, status) =>
    axios.put(`${buildUrl(ENDPOINTS.ORDERS.STATUS(id))}?order_status=${status}`),

  verifyPayment: (paymentData) =>
    axios.post(buildUrl(ENDPOINTS.ORDERS.VERIFY_PAYMENT), paymentData),
};

export const paymentService = {
  getRazorpayKey: () =>
    axios.get(buildUrl(ENDPOINTS.RAZORPAY_KEY)),
};
