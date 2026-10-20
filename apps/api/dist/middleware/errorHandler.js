import { config } from '../config/index.js';
export function errorHandler(err, _req, res, _next) {
    console.error('Unhandled API Error:', err);
    const statusCode = err.statusCode || 500;
    const message = config.isProd && statusCode === 500
        ? 'An unexpected error occurred while processing your request. Please try again later.'
        : err.message || 'Internal server error';
    res.status(statusCode).json({
        success: false,
        error: {
            code: err.code || 'INTERNAL_SERVER_ERROR',
            message,
            details: config.isProd ? undefined : err.stack,
        },
    });
}
//# sourceMappingURL=errorHandler.js.map