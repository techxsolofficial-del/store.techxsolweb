import { Request, Response, NextFunction } from 'express';
export declare class AdminController {
    static login(req: Request, res: Response, next: NextFunction): Promise<void>;
    static verifySession(req: Request, res: Response): Promise<void>;
    static getDashboard(_req: Request, res: Response, next: NextFunction): Promise<void>;
    static getProducts(req: Request, res: Response, next: NextFunction): Promise<void>;
    static createProduct(req: Request, res: Response, next: NextFunction): Promise<void>;
    static updateProduct(req: Request, res: Response, next: NextFunction): Promise<void>;
    static deleteProduct(req: Request, res: Response, next: NextFunction): Promise<void>;
    static getCategories(_req: Request, res: Response, next: NextFunction): Promise<void>;
    static createCategory(req: Request, res: Response, next: NextFunction): Promise<void>;
    static updateCategory(req: Request, res: Response, next: NextFunction): Promise<void>;
    static getSuppliers(_req: Request, res: Response, next: NextFunction): Promise<void>;
    static createSupplier(req: Request, res: Response, next: NextFunction): Promise<void>;
    static updateSupplier(req: Request, res: Response, next: NextFunction): Promise<void>;
    static getOrders(req: Request, res: Response, next: NextFunction): Promise<void>;
    static getOrderById(req: Request, res: Response, next: NextFunction): Promise<void>;
    static updateOrderStatus(req: Request, res: Response, next: NextFunction): Promise<void>;
    static addOrderNote(req: Request, res: Response, next: NextFunction): Promise<void>;
    static addFulfilment(req: Request, res: Response, next: NextFunction): Promise<void>;
    static updateFulfilment(req: Request, res: Response, next: NextFunction): Promise<void>;
    static addFinancialTransaction(req: Request, res: Response, next: NextFunction): Promise<void>;
    static getReports(_req: Request, res: Response, next: NextFunction): Promise<void>;
    static getSettings(_req: Request, res: Response, next: NextFunction): Promise<void>;
    static updateSettings(req: Request, res: Response, next: NextFunction): Promise<void>;
}
