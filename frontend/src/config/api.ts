// API Configuration
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export const API_CONFIG = {
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
};

// API Endpoints
export const ENDPOINTS = {
  // Auth
  LOGIN: '/auth/login',
  SIGNUP: '/auth/signup',
  SEND_OTP: '/auth/send-otp',
  VERIFY_OTP: '/auth/verify-otp',
  RESET_PASSWORD: '/auth/reset-password',
  
  // Users
  USER_ME: '/users/me',
  UPDATE_USER: '/users/me',
  
  // Requirements
  REQUIREMENTS: '/requirements',
  REQUIREMENT_MATCHES: (id: number) => `/requirements/${id}/matches`,
  
  // Resources
  RESOURCES: '/resources',
  
  // Contracts
  CONTRACTS: '/contracts',
  CONTRACT_STATUS: (id: number) => `/contracts/${id}/status`,
  
  // Dashboard
  CLIENT_STATS: '/dashboard/client/stats',
  VENDOR_STATS: '/dashboard/vendor/stats',
  
  // Analytics
  VENDOR_TRENDS: '/analytics/vendor/availability-trend',
  
  // Billing
  BILLING_PLANS: '/billing/plans',
  BILLING_INVOICES: '/billing/invoices',
  UPGRADE_SUBSCRIPTION: '/subscriptions/upgrade',
  
  // Notifications
  NOTIFICATIONS: '/notifications',
  MARK_NOTIFICATION_READ: (id: number) => `/notifications/${id}/read`,
  MARK_ALL_NOTIFICATIONS_READ: '/notifications/read-all',
  
  // Messages
  MESSAGES: '/messages',
  UNREAD_COUNT: '/messages/unread/count',
};