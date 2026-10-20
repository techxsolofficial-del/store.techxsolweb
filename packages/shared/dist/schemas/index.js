import { z } from 'zod';
import { ORDER_STATUSES, PAYMENT_STATUSES, ORDER_SOURCE_CHANNELS, PAKISTAN_PHONE_REGEX, } from '../constants/index.js';
export const pakistanPhoneSchema = z
    .string()
    .trim()
    .refine((val) => PAKISTAN_PHONE_REGEX.test(val.replace(/\s+/g, '').replace(/-/g, '')), {
    message: 'Please provide a valid Pakistani mobile number (e.g., 03001234567 or +923001234567)',
});
export const createOrderSchema = z.object({
    customer: z.object({
        name: z.string().trim().min(2, 'Name must be at least 2 characters').max(100),
        phone: pakistanPhoneSchema,
        alternatePhone: z.string().trim().optional().or(z.literal('')),
        city: z.string().trim().min(2, 'City is required').max(100),
        deliveryAddress: z
            .string()
            .trim()
            .min(5, 'Complete delivery address including street and house number is required')
            .max(500),
        deliveryInstructions: z.string().trim().max(300).optional(),
    }),
    items: z
        .array(z.object({
        productId: z.string().min(1, 'Invalid product ID'),
        variantId: z.string().optional(),
        quantity: z.number().int().min(1, 'Quantity must be at least 1').max(20, 'Maximum 20 units per item'),
    }))
        .min(1, 'At least one item is required in your order'),
    sourceChannel: z.enum(ORDER_SOURCE_CHANNELS).default('website'),
});
export const trackOrderSchema = z.object({
    reference: z.string().trim().min(5, 'Order reference is required'),
    phone: pakistanPhoneSchema,
});
export const productVariantSchema = z.object({
    id: z.string(),
    name: z.string().min(1),
    sku: z.string().optional(),
    priceDeltaPkr: z.number().int().default(0),
    supplierCostDeltaPkr: z.number().int().default(0),
    isAvailable: z.boolean().default(true),
});
export const productImageSchema = z.object({
    id: z.string(),
    url: z.string().url('Must be a valid image URL'),
    altText: z.string().optional(),
    isPrimary: z.boolean().default(false),
});
export const productSupplierOfferSchema = z.object({
    id: z.string().optional(),
    supplierId: z.string().min(1, 'Supplier ID is required'),
    supplierSku: z.string().min(1),
    supplierCostPkr: z.number().int().min(0, 'Supplier cost cannot be negative'),
    isAvailable: z.boolean().default(true),
    leadTimeDays: z.number().int().min(0).default(2),
    notes: z.string().optional(),
});
export const productCreateSchema = z.object({
    categoryId: z.string().min(1, 'Category is required'),
    name: z.string().trim().min(2).max(200),
    slug: z.string().trim().min(2).max(200).regex(/^[a-z0-9-]+$/, 'Slug must be alphanumeric and hyphens only'),
    shortDescription: z.string().trim().min(5).max(300),
    description: z.string().trim().min(10),
    basePricePkr: z.number().int().min(1, 'Price must be positive'),
    compareAtPricePkr: z.number().int().positive().optional().nullable(),
    sku: z.string().trim().min(1),
    isActive: z.boolean().default(true),
    isFeatured: z.boolean().default(false),
    images: z.array(productImageSchema).min(1, 'At least one product image is required'),
    variants: z.array(productVariantSchema).default([]),
    supplierOffers: z.array(productSupplierOfferSchema).default([]),
});
export const categoryCreateSchema = z.object({
    name: z.string().trim().min(2).max(100),
    slug: z.string().trim().min(2).max(100).regex(/^[a-z0-9-]+$/, 'Slug must be alphanumeric and hyphens only'),
    description: z.string().trim().optional(),
    image: z.string().url().optional(),
    isActive: z.boolean().default(true),
    displayOrder: z.number().int().default(0),
});
export const supplierCreateSchema = z.object({
    businessName: z.string().trim().min(2).max(150),
    contactName: z.string().trim().min(2).max(100),
    phone: z.string().trim().min(8).max(30),
    email: z.string().email().optional().or(z.literal('')),
    city: z.string().trim().min(2).max(100),
    address: z.string().trim().optional(),
    fulfilmentTerms: z.string().trim().optional(),
    returnPolicy: z.string().trim().optional(),
    payoutTerms: z.string().trim().optional(),
    isActive: z.boolean().default(true),
    notes: z.string().trim().optional(),
});
export const updateOrderStatusSchema = z.object({
    status: z.enum(ORDER_STATUSES),
    paymentStatus: z.enum(PAYMENT_STATUSES).optional(),
    reason: z.string().trim().optional(),
    notes: z.string().trim().optional(),
});
export const createFulfilmentSchema = z.object({
    supplierId: z.string().min(1, 'Supplier ID is required'),
    supplierOrderRef: z.string().trim().optional(),
    courierName: z.string().trim().optional(), // TCS, Leopards, Trax, Call Courier, etc.
    trackingNumber: z.string().trim().optional(),
    trackingUrl: z.string().url().optional().or(z.literal('')),
    courierChargePkr: z.number().int().min(0).default(0),
});
export const updateFulfilmentSchema = z.object({
    status: z.enum(['unassigned', 'assigned', 'sent_to_supplier', 'dispatched', 'delivered', 'failed', 'returned']),
    courierName: z.string().trim().optional(),
    trackingNumber: z.string().trim().optional(),
    failureReason: z.string().trim().optional(),
    courierChargePkr: z.number().int().min(0).optional(),
    returnChargePkr: z.number().int().min(0).optional(),
});
export const createFinancialTransactionSchema = z.object({
    transactionType: z.enum(['cod_collection', 'supplier_payout', 'courier_fee', 'return_loss', 'refund', 'adjustment']),
    amountPkr: z.number().int().positive('Amount must be positive'),
    referenceNumber: z.string().trim().optional(),
    status: z.enum(['pending', 'completed', 'cancelled']).default('completed'),
    notes: z.string().trim().optional(),
});
export const updateSettingsSchema = z.object({
    storeName: z.string().trim().min(2),
    tagline: z.string().trim().min(2),
    whatsappNumber: z.string().trim().min(10),
    supportEmail: z.string().email(),
    supportPhone: z.string().trim().min(7),
    currency: z.string().default('PKR'),
    defaultDeliveryChargePkr: z.number().int().min(0),
    freeDeliveryThresholdPkr: z.number().int().min(0),
    estimatedDeliveryDays: z.string(),
    codTerms: z.string(),
    returnPolicySummary: z.string(),
    aboutText: z.string(),
});
//# sourceMappingURL=index.js.map