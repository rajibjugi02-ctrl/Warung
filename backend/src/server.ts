import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import morgan from 'morgan';
import path from 'path';
import routes from './routes';
import { ENV } from './config/env';

const app = express();

// Middlewares
app.use(
  cors({
    origin: '*',
    credentials: true,
  })
);
app.use(express.json({ limit: '15mb' }));
app.use(express.urlencoded({ extended: true, limit: '15mb' }));

// Serve static uploads
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

if (ENV.NODE_ENV !== 'test') {
  app.use(morgan('dev'));
}

// Health check
app.get('/api/health', (_req: Request, res: Response) => {
  res.json({
    status: 'ok',
    name: 'Warung Jajanan Lenira API',
    timestamp: new Date().toISOString(),
  });
});

// API Routes
app.use('/api', routes);

// Centralized error handler
app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
  console.error('🔥 Server Error:', err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Terjadi kesalahan pada server internal.',
    stack: ENV.NODE_ENV === 'development' ? err.stack : undefined,
  });
});

const PORT = parseInt(ENV.PORT, 10) || 5000;

app.listen(PORT, () => {
  console.log(`
  ======================================================
  🏪 Warung Jajanan Lenira Backend API is Running!
  🚀 Port: http://localhost:${PORT}
  💳 Payment Mode: ${ENV.PAYMENT_GATEWAY_MODE.toUpperCase()}
  🌐 Frontend URL: ${ENV.FRONTEND_URL}
  ======================================================
  `);
});

export default app;
