import jwt from 'jsonwebtoken';
import { config } from '../config/index.js';
export function generateToken(user) {
    return jwt.sign(user, config.jwtSecret, { expiresIn: '7d' });
}
export function verifyToken(token) {
    try {
        return jwt.verify(token, config.jwtSecret);
    }
    catch {
        return null;
    }
}
export function requireAdminAuth(req, res, next) {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        res.status(401).json({
            success: false,
            error: {
                code: 'UNAUTHORIZED',
                message: 'Authentication token required to access this resource.',
            },
        });
        return;
    }
    const token = authHeader.split(' ')[1];
    const user = verifyToken(token);
    if (!user) {
        res.status(401).json({
            success: false,
            error: {
                code: 'INVALID_TOKEN',
                message: 'Invalid or expired authentication session. Please sign in again.',
            },
        });
        return;
    }
    if (user.role !== 'admin') {
        res.status(403).json({
            success: false,
            error: {
                code: 'FORBIDDEN',
                message: 'Administrative privileges required for this action.',
            },
        });
        return;
    }
    req.user = user;
    next();
}
//# sourceMappingURL=auth.js.map