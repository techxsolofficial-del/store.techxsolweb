import { Router } from 'express';
import { AdminController } from '../controllers/adminController.js';
import { requireAdminAuth } from '../middleware/auth.js';
import { validateRequest } from '../middleware/validate.js';
import {
  productCreateSchema,
  categoryCreateSchema,
  supplierCreateSchema,
  updateOrderStatusSchema,
  createFulfilmentSchema,
  updateFulfilmentSchema,
  createFinancialTransactionSchema,
  updateSettingsSchema,
} from '@dropship/shared';

const router = Router();

// Public auth endpoints
router.post('/auth/login', AdminController.login);

// Protected routes below
router.use(requireAdminAuth);

router.get('/auth/verify', AdminController.verifySession);
router.get('/dashboard', AdminController.getDashboard);

// Products
router.get('/products', AdminController.getProducts);
router.post('/products', validateRequest(productCreateSchema), AdminController.createProduct);
router.put('/products/:id', AdminController.updateProduct);
router.delete('/products/:id', AdminController.deleteProduct);

// Categories
router.get('/categories', AdminController.getCategories);
router.post('/categories', validateRequest(categoryCreateSchema), AdminController.createCategory);
router.put('/categories/:id', AdminController.updateCategory);

// Suppliers
router.get('/suppliers', AdminController.getSuppliers);
router.post('/suppliers', validateRequest(supplierCreateSchema), AdminController.createSupplier);
router.put('/suppliers/:id', AdminController.updateSupplier);

// Orders
router.get('/orders', AdminController.getOrders);
router.get('/orders/:id', AdminController.getOrderById);
router.patch('/orders/:id/status', validateRequest(updateOrderStatusSchema), AdminController.updateOrderStatus);
router.post('/orders/:id/notes', AdminController.addOrderNote);

// Fulfilment & Tracking
router.post('/orders/:id/fulfilments', validateRequest(createFulfilmentSchema), AdminController.addFulfilment);
router.patch('/orders/:id/fulfilments/:fulfilmentId', validateRequest(updateFulfilmentSchema), AdminController.updateFulfilment);

// Financials & Settlements
router.post('/orders/:id/transactions', validateRequest(createFinancialTransactionSchema), AdminController.addFinancialTransaction);

// Reports & Settings
router.get('/reports', AdminController.getReports);
router.get('/settings', AdminController.getSettings);
router.put('/settings', validateRequest(updateSettingsSchema), AdminController.updateSettings);

export default router;

