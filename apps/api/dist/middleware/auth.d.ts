import { Request, Response, NextFunction } from 'express';
export interface AuthUser {
    id: string;
    email: string;
    displayName: string;
    role: 'admin' | 'staff';
}
declare global {
    namespace Express {
        interface Request {
            user?: AuthUser;
        }
    }
}
export declare function generateToken(user: AuthUser): string;
export declare function verifyToken(token: string): AuthUser | null;
export declare function requireAdminAuth(req: Request, res: Response, next: NextFunction): void;
