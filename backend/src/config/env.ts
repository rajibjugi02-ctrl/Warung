import dotenv from 'dotenv';
dotenv.config();

export const ENV = {
  PORT: process.env.PORT || '5000',
  NODE_ENV: process.env.NODE_ENV || 'development',
  DATABASE_URL: process.env.DATABASE_URL || 'file:./dev.db',
  JWT_SECRET: process.env.JWT_SECRET || 'default-secret-warung-lenira-key',
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '7d',
  FRONTEND_URL: process.env.FRONTEND_URL || 'http://localhost:5173',
  BACKEND_URL: process.env.BACKEND_URL || 'http://localhost:5000',

  // Payment Gateway
  PAYMENT_GATEWAY_MODE: process.env.PAYMENT_GATEWAY_MODE || 'sandbox', // 'sandbox' | 'midtrans' | 'xendit'
  PAYMENT_GATEWAY_SERVER_KEY: process.env.PAYMENT_GATEWAY_SERVER_KEY || '',
  PAYMENT_GATEWAY_CLIENT_KEY: process.env.PAYMENT_GATEWAY_CLIENT_KEY || '',
  PAYMENT_GATEWAY_SECRET_KEY: process.env.PAYMENT_GATEWAY_SECRET_KEY || '',
};
