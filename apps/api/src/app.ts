import express, { Express } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import publicRoutes from './routes/publicRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import { errorHandler } from './middleware/errorHandler.js';
import { config } from './config/index.js';

export function createApp(): Express {
  const app = express();

  // CORS configuration
  app.use(cors({ origin: true, credentials: true }));

  // Body parser with 1mb limit to mitigate payload inflation attacks
  app.use(express.json({ limit: '1mb' }));
  app.use(express.urlencoded({ extended: true, limit: '1mb' }));

  // API Routes - support both with /api prefix and without
  app.use('/api/admin', adminRoutes);
  app.use('/admin', adminRoutes);
  app.use('/api', publicRoutes);
  app.use('/', publicRoutes);

  // 404 Route Handler
  app.use((_req, res) => {
    res.status(404).json({
      success: false,
      error: {
        code: 'ROUTE_NOT_FOUND',
        message: 'The requested API resource does not exist.',
      },
    });
  });

  // Centralized Error Handler
  app.use(errorHandler);

  return app;
}

