import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import publicRoutes from './routes/publicRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import { errorHandler } from './middleware/errorHandler.js';
import { config } from './config/index.js';
export function createApp() {
    const app = express();
    // Security Headers
    app.use(helmet());
    // CORS configuration
    app.use(cors({
        origin: (origin, callback) => {
            // Allow requests with no origin (e.g. mobile apps or curl) or if origin is in allowlist
            if (!origin || config.corsOrigins.includes(origin) || !config.isProd) {
                callback(null, true);
            }
            else {
                callback(new Error('Blocked by CORS policy'));
            }
        },
        credentials: true,
        methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
        allowedHeaders: ['Content-Type', 'Authorization', 'x-idempotency-key'],
    }));
    // Body parser with 1mb limit to mitigate payload inflation attacks
    app.use(express.json({ limit: '1mb' }));
    app.use(express.urlencoded({ extended: true, limit: '1mb' }));
    // API Routes
    app.use('/api', publicRoutes);
    app.use('/api/admin', adminRoutes);
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
//# sourceMappingURL=app.js.map