import { Request, Response, NextFunction } from 'express';
import { getDataStore } from '../repositories/index.js';
import { generateToken } from '../middleware/auth.js';
import { config } from '../config/index.js';
import {
  ProductCreateInput,
  CategoryCreateInput,
  SupplierCreateInput,
  UpdateOrderStatusInput,
  CreateFulfilmentInput,
  UpdateFulfilmentInput,
  CreateFinancialTransactionInput,
  UpdateSettingsInput,
} from '@dropship/shared';

export class AdminController {
  // Admin Authentication
  static async login(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { email, password } = req.body;

      // In production with Supabase Auth, verify with Supabase.
      // Here verify against configured admin credentials.
      if (email === config.adminDefault.email && password === config.adminDefault.password) {
        const token = generateToken({
          id: 'admin-primary-1',
          email,
          displayName: config.adminDefault.displayName,
          role: 'admin',
        });

        res.json({
          success: true,
          data: {
            token,
            user: {
              id: 'admin-primary-1',
              email,
              displayName: config.adminDefault.displayName,
              role: 'admin',
            },
          },
        });
        return;
      }

      res.status(401).json({
        success: false,
        error: {
          code: 'INVALID_CREDENTIALS',
          message: 'Invalid email or password.',
        },
      });
    } catch (err) {
      next(err);
    }
  }

  static async verifySession(req: Request, res: Response): Promise<void> {
    res.json({
      success: true,
      data: req.user,
    });
  }

  // Dashboard Metrics
  static async getDashboard(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const store = getDataStore();
      const metrics = await store.getDashboardMetrics();
      res.json({
        success: true,
        data: metrics,
      });
    } catch (err) {
      next(err);
    }
  }

  // Products Management
  static async getProducts(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const store = getDataStore();
      const { search, category, page = '1', limit = '50' } = req.query;
      const { products, total } = await store.getProducts({
        search: search as string,
        categoryId: category as string,
        page: parseInt(page as string, 10),
        limit: parseInt(limit as string, 10),
        activeOnly: false,
      });
      res.json({
        success: true,
        data: products,
        pagination: { total, page: parseInt(page as string, 10), limit: parseInt(limit as string, 10) },
      });
    } catch (err) {
      next(err);
    }
  }

  static async createProduct(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const store = getDataStore();
      const input = req.body as ProductCreateInput;
      const created = await store.createProduct(input as any);
      res.status(201).json({
        success: true,
        data: created,
        message: 'Product created successfully',
      });
    } catch (err) {
      next(err);
    }
  }

  static async updateProduct(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const store = getDataStore();
      const id = String(req.params.id);
      const updated = await store.updateProduct(id, req.body);
      if (!updated) {
        res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Product not found' } });
        return;
      }
      res.json({ success: true, data: updated, message: 'Product updated successfully' });
    } catch (err) {
      next(err);
    }
  }

  static async deleteProduct(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const store = getDataStore();
      const id = String(req.params.id);
      const success = await store.deleteProduct(id);
      if (!success) {
        res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Product not found' } });
        return;
      }
      res.json({ success: true, message: 'Product deleted successfully' });
    } catch (err) {
      next(err);
    }
  }

  // Categories Management
  static async getCategories(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const store = getDataStore();
      const categories = await store.getCategories(false);
      res.json({ success: true, data: categories });
    } catch (err) {
      next(err);
    }
  }

  static async createCategory(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const store = getDataStore();
      const input = req.body as CategoryCreateInput;
      const created = await store.createCategory(input);
      res.status(201).json({ success: true, data: created, message: 'Category created' });
    } catch (err) {
      next(err);
    }
  }

  static async updateCategory(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const store = getDataStore();
      const id = String(req.params.id);
      const updated = await store.updateCategory(id, req.body);
      if (!updated) {
        res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Category not found' } });
        return;
      }
      res.json({ success: true, data: updated, message: 'Category updated' });
    } catch (err) {
      next(err);
    }
  }

  // Suppliers Management
  static async getSuppliers(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const store = getDataStore();
      const suppliers = await store.getSuppliers(false);
      res.json({ success: true, data: suppliers });
    } catch (err) {
      next(err);
    }
  }

  static async createSupplier(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const store = getDataStore();
      const input = req.body as SupplierCreateInput;
      const created = await store.createSupplier(input);
      res.status(201).json({ success: true, data: created, message: 'Supplier created' });
    } catch (err) {
      next(err);
    }
  }

  static async updateSupplier(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const store = getDataStore();
      const id = String(req.params.id);
      const updated = await store.updateSupplier(id, req.body);
      if (!updated) {
        res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Supplier not found' } });
        return;
      }
      res.json({ success: true, data: updated, message: 'Supplier updated' });
    } catch (err) {
      next(err);
    }
  }

  // Orders Management
  static async getOrders(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const store = getDataStore();
      const { status, paymentStatus, channel, city, search, page = '1', limit = '30' } = req.query;

      const pageNum = parseInt(page as string, 10) || 1;
      const limitNum = parseInt(limit as string, 10) || 30;

      const { orders, total } = await store.getOrders({
        status: status as any,
        paymentStatus: paymentStatus as any,
        channel: channel as any,
        city: city as string,
        search: search as string,
        page: pageNum,
        limit: limitNum,
      });

      res.json({
        success: true,
        data: orders,
        pagination: {
          page: pageNum,
          limit: limitNum,
          total,
          totalPages: Math.ceil(total / limitNum),
        },
      });
    } catch (err) {
      next(err);
    }
  }

  static async getOrderById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const store = getDataStore();
      const id = String(req.params.id);
      const order = await store.getOrderById(id);

      if (!order) {
        res.status(404).json({
          success: false,
          error: { code: 'ORDER_NOT_FOUND', message: 'Order not found' },
        });
        return;
      }

      res.json({ success: true, data: order });
    } catch (err) {
      next(err);
    }
  }

  static async updateOrderStatus(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const store = getDataStore();
      const id = String(req.params.id);
      const { status, paymentStatus, reason, notes } = req.body as UpdateOrderStatusInput;

      const updated = await store.updateOrderStatus(
        id,
        status,
        paymentStatus,
        reason || notes,
        req.user?.id,
        req.user?.displayName
      );

      if (!updated) {
        res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Order not found' } });
        return;
      }

      res.json({ success: true, data: updated, message: 'Order status updated' });
    } catch (err) {
      next(err);
    }
  }

  static async addOrderNote(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const store = getDataStore();
      const id = String(req.params.id);
      const { note } = req.body;

      if (!note || typeof note !== 'string') {
        res.status(400).json({ success: false, error: { code: 'NOTE_REQUIRED', message: 'Note text is required' } });
        return;
      }

      const updated = await store.addOrderInternalNote(id, note);
      if (!updated) {
        res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Order not found' } });
        return;
      }

      res.json({ success: true, data: updated, message: 'Note added to order' });
    } catch (err) {
      next(err);
    }
  }

  static async addFulfilment(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const store = getDataStore();
      const id = String(req.params.id);
      const input = req.body as CreateFulfilmentInput;

      const updated = await store.addOrderFulfilment(id, {
        supplierId: input.supplierId,
        supplierOrderRef: input.supplierOrderRef,
        courierName: input.courierName,
        trackingNumber: input.trackingNumber,
        trackingUrl: input.trackingUrl,
        status: 'assigned',
        courierChargePkr: input.courierChargePkr || 0,
        returnChargePkr: 0,
      });

      if (!updated) {
        res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Order not found' } });
        return;
      }

      res.json({ success: true, data: updated, message: 'Fulfilment assigned' });
    } catch (err) {
      next(err);
    }
  }

  static async updateFulfilment(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const store = getDataStore();
      const id = String(req.params.id);
      const fulfilmentId = String(req.params.fulfilmentId);
      const input = req.body as UpdateFulfilmentInput;

      const updated = await store.updateOrderFulfilment(id, fulfilmentId, input);
      if (!updated) {
        res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Order or fulfilment not found' } });
        return;
      }

      res.json({ success: true, data: updated, message: 'Fulfilment updated' });
    } catch (err) {
      next(err);
    }
  }

  static async addFinancialTransaction(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const store = getDataStore();
      const id = String(req.params.id);
      const input = req.body as CreateFinancialTransactionInput;

      const updated = await store.addFinancialTransaction(id, input);
      if (!updated) {
        res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Order not found' } });
        return;
      }

      res.json({ success: true, data: updated, message: 'Financial transaction recorded' });
    } catch (err) {
      next(err);
    }
  }

  // Reports
  static async getReports(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const store = getDataStore();
      const { orders } = await store.getOrders({ limit: 1000 });

      const channelBreakdown = {
        website: orders.filter((o) => o.sourceChannel === 'website').length,
        whatsapp: orders.filter((o) => o.sourceChannel === 'whatsapp').length,
      };

      const statusBreakdown: Record<string, number> = {};
      let totalCollected = 0;
      let totalEstimatedProfit = 0;
      let totalActualProfit = 0;

      orders.forEach((o) => {
        statusBreakdown[o.orderStatus] = (statusBreakdown[o.orderStatus] || 0) + 1;
        totalEstimatedProfit += o.estimatedProfitPkr || 0;
        totalActualProfit += o.actualProfitPkr || 0;
        if (o.paymentStatus === 'settled' || o.paymentStatus === 'cod_collected') {
          totalCollected += o.totalPayablePkr;
        }
      });

      res.json({
        success: true,
        data: {
          channelBreakdown,
          statusBreakdown,
          financials: {
            totalCollectedPkr: totalCollected,
            totalEstimatedProfitPkr: totalEstimatedProfit,
            totalActualProfitPkr: totalActualProfit,
          },
        },
      });
    } catch (err) {
      next(err);
    }
  }

  // Settings
  static async getSettings(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const store = getDataStore();
      const settings = await store.getStoreSettings();
      res.json({ success: true, data: settings });
    } catch (err) {
      next(err);
    }
  }

  static async updateSettings(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const store = getDataStore();
      const input = req.body as UpdateSettingsInput;

      // Normalize WhatsApp phone number: remove non-digits, convert 03xx to 923xx
      if (input.whatsappNumber) {
        let clean = input.whatsappNumber.replace(/[\s\-\+\(\)]/g, '');
        if (clean.startsWith('03')) {
          clean = '92' + clean.slice(1);
        }
        input.whatsappNumber = clean;
      }

      // If support phone is empty or mirrors old number, format from whatsapp number
      if (!input.supportPhone && input.whatsappNumber) {
        input.supportPhone = input.whatsappNumber.startsWith('92')
          ? '0' + input.whatsappNumber.slice(2, 5) + ' ' + input.whatsappNumber.slice(5)
          : input.whatsappNumber;
      }

      const updated = await store.updateStoreSettings(input);
      res.json({ success: true, data: updated, message: 'Settings saved successfully' });
    } catch (err) {
      next(err);
    }
  }
}
