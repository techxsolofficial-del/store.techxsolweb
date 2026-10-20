import { Request, Response, NextFunction } from 'express';
export declare class PublicController {
    static getPublicSettings(_req: Request, res: Response, next: NextFunction): Promise<void>;
    static getCategories(_req: Request, res: Response, next: NextFunction): Promise<void>;
    static getProducts(req: Request, res: Response, next: NextFunction): Promise<void>;
    static getProductBySlug(req: Request, res: Response, next: NextFunction): Promise<void>;
    static createOrder(req: Request, res: Response, next: NextFunction): Promise<void>;
    static trackOrder(req: Request, res: Response, next: NextFunction): Promise<void>;
}
