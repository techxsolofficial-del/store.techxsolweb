import { z } from 'zod';
export declare const pakistanPhoneSchema: z.ZodEffects<z.ZodString, string, string>;
export declare const createOrderSchema: z.ZodObject<{
    customer: z.ZodObject<{
        name: z.ZodString;
        phone: z.ZodEffects<z.ZodString, string, string>;
        alternatePhone: z.ZodUnion<[z.ZodOptional<z.ZodString>, z.ZodLiteral<"">]>;
        city: z.ZodString;
        deliveryAddress: z.ZodString;
        deliveryInstructions: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        name: string;
        phone: string;
        city: string;
        deliveryAddress: string;
        alternatePhone?: string | undefined;
        deliveryInstructions?: string | undefined;
    }, {
        name: string;
        phone: string;
        city: string;
        deliveryAddress: string;
        alternatePhone?: string | undefined;
        deliveryInstructions?: string | undefined;
    }>;
    items: z.ZodArray<z.ZodObject<{
        productId: z.ZodString;
        variantId: z.ZodOptional<z.ZodString>;
        quantity: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        productId: string;
        quantity: number;
        variantId?: string | undefined;
    }, {
        productId: string;
        quantity: number;
        variantId?: string | undefined;
    }>, "many">;
    sourceChannel: z.ZodDefault<z.ZodEnum<["website", "whatsapp"]>>;
}, "strip", z.ZodTypeAny, {
    customer: {
        name: string;
        phone: string;
        city: string;
        deliveryAddress: string;
        alternatePhone?: string | undefined;
        deliveryInstructions?: string | undefined;
    };
    items: {
        productId: string;
        quantity: number;
        variantId?: string | undefined;
    }[];
    sourceChannel: "website" | "whatsapp";
}, {
    customer: {
        name: string;
        phone: string;
        city: string;
        deliveryAddress: string;
        alternatePhone?: string | undefined;
        deliveryInstructions?: string | undefined;
    };
    items: {
        productId: string;
        quantity: number;
        variantId?: string | undefined;
    }[];
    sourceChannel?: "website" | "whatsapp" | undefined;
}>;
export type CreateOrderInput = z.infer<typeof createOrderSchema>;
export declare const trackOrderSchema: z.ZodObject<{
    reference: z.ZodString;
    phone: z.ZodEffects<z.ZodString, string, string>;
}, "strip", z.ZodTypeAny, {
    phone: string;
    reference: string;
}, {
    phone: string;
    reference: string;
}>;
export type TrackOrderInput = z.infer<typeof trackOrderSchema>;
export declare const productVariantSchema: z.ZodObject<{
    id: z.ZodString;
    name: z.ZodString;
    sku: z.ZodOptional<z.ZodString>;
    priceDeltaPkr: z.ZodDefault<z.ZodNumber>;
    supplierCostDeltaPkr: z.ZodDefault<z.ZodNumber>;
    isAvailable: z.ZodDefault<z.ZodBoolean>;
}, "strip", z.ZodTypeAny, {
    name: string;
    id: string;
    priceDeltaPkr: number;
    supplierCostDeltaPkr: number;
    isAvailable: boolean;
    sku?: string | undefined;
}, {
    name: string;
    id: string;
    sku?: string | undefined;
    priceDeltaPkr?: number | undefined;
    supplierCostDeltaPkr?: number | undefined;
    isAvailable?: boolean | undefined;
}>;
export declare const productImageSchema: z.ZodObject<{
    id: z.ZodString;
    url: z.ZodString;
    altText: z.ZodOptional<z.ZodString>;
    isPrimary: z.ZodDefault<z.ZodBoolean>;
}, "strip", z.ZodTypeAny, {
    id: string;
    url: string;
    isPrimary: boolean;
    altText?: string | undefined;
}, {
    id: string;
    url: string;
    altText?: string | undefined;
    isPrimary?: boolean | undefined;
}>;
export declare const productSupplierOfferSchema: z.ZodObject<{
    id: z.ZodOptional<z.ZodString>;
    supplierId: z.ZodString;
    supplierSku: z.ZodString;
    supplierCostPkr: z.ZodNumber;
    isAvailable: z.ZodDefault<z.ZodBoolean>;
    leadTimeDays: z.ZodDefault<z.ZodNumber>;
    notes: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    isAvailable: boolean;
    supplierId: string;
    supplierSku: string;
    supplierCostPkr: number;
    leadTimeDays: number;
    id?: string | undefined;
    notes?: string | undefined;
}, {
    supplierId: string;
    supplierSku: string;
    supplierCostPkr: number;
    id?: string | undefined;
    isAvailable?: boolean | undefined;
    leadTimeDays?: number | undefined;
    notes?: string | undefined;
}>;
export declare const productCreateSchema: z.ZodObject<{
    categoryId: z.ZodString;
    name: z.ZodString;
    slug: z.ZodString;
    shortDescription: z.ZodString;
    description: z.ZodString;
    basePricePkr: z.ZodNumber;
    compareAtPricePkr: z.ZodNullable<z.ZodOptional<z.ZodNumber>>;
    sku: z.ZodString;
    isActive: z.ZodDefault<z.ZodBoolean>;
    isFeatured: z.ZodDefault<z.ZodBoolean>;
    images: z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        url: z.ZodString;
        altText: z.ZodOptional<z.ZodString>;
        isPrimary: z.ZodDefault<z.ZodBoolean>;
    }, "strip", z.ZodTypeAny, {
        id: string;
        url: string;
        isPrimary: boolean;
        altText?: string | undefined;
    }, {
        id: string;
        url: string;
        altText?: string | undefined;
        isPrimary?: boolean | undefined;
    }>, "many">;
    variants: z.ZodDefault<z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        name: z.ZodString;
        sku: z.ZodOptional<z.ZodString>;
        priceDeltaPkr: z.ZodDefault<z.ZodNumber>;
        supplierCostDeltaPkr: z.ZodDefault<z.ZodNumber>;
        isAvailable: z.ZodDefault<z.ZodBoolean>;
    }, "strip", z.ZodTypeAny, {
        name: string;
        id: string;
        priceDeltaPkr: number;
        supplierCostDeltaPkr: number;
        isAvailable: boolean;
        sku?: string | undefined;
    }, {
        name: string;
        id: string;
        sku?: string | undefined;
        priceDeltaPkr?: number | undefined;
        supplierCostDeltaPkr?: number | undefined;
        isAvailable?: boolean | undefined;
    }>, "many">>;
    supplierOffers: z.ZodDefault<z.ZodArray<z.ZodObject<{
        id: z.ZodOptional<z.ZodString>;
        supplierId: z.ZodString;
        supplierSku: z.ZodString;
        supplierCostPkr: z.ZodNumber;
        isAvailable: z.ZodDefault<z.ZodBoolean>;
        leadTimeDays: z.ZodDefault<z.ZodNumber>;
        notes: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        isAvailable: boolean;
        supplierId: string;
        supplierSku: string;
        supplierCostPkr: number;
        leadTimeDays: number;
        id?: string | undefined;
        notes?: string | undefined;
    }, {
        supplierId: string;
        supplierSku: string;
        supplierCostPkr: number;
        id?: string | undefined;
        isAvailable?: boolean | undefined;
        leadTimeDays?: number | undefined;
        notes?: string | undefined;
    }>, "many">>;
}, "strip", z.ZodTypeAny, {
    name: string;
    sku: string;
    categoryId: string;
    slug: string;
    shortDescription: string;
    description: string;
    basePricePkr: number;
    isActive: boolean;
    isFeatured: boolean;
    images: {
        id: string;
        url: string;
        isPrimary: boolean;
        altText?: string | undefined;
    }[];
    variants: {
        name: string;
        id: string;
        priceDeltaPkr: number;
        supplierCostDeltaPkr: number;
        isAvailable: boolean;
        sku?: string | undefined;
    }[];
    supplierOffers: {
        isAvailable: boolean;
        supplierId: string;
        supplierSku: string;
        supplierCostPkr: number;
        leadTimeDays: number;
        id?: string | undefined;
        notes?: string | undefined;
    }[];
    compareAtPricePkr?: number | null | undefined;
}, {
    name: string;
    sku: string;
    categoryId: string;
    slug: string;
    shortDescription: string;
    description: string;
    basePricePkr: number;
    images: {
        id: string;
        url: string;
        altText?: string | undefined;
        isPrimary?: boolean | undefined;
    }[];
    compareAtPricePkr?: number | null | undefined;
    isActive?: boolean | undefined;
    isFeatured?: boolean | undefined;
    variants?: {
        name: string;
        id: string;
        sku?: string | undefined;
        priceDeltaPkr?: number | undefined;
        supplierCostDeltaPkr?: number | undefined;
        isAvailable?: boolean | undefined;
    }[] | undefined;
    supplierOffers?: {
        supplierId: string;
        supplierSku: string;
        supplierCostPkr: number;
        id?: string | undefined;
        isAvailable?: boolean | undefined;
        leadTimeDays?: number | undefined;
        notes?: string | undefined;
    }[] | undefined;
}>;
export type ProductCreateInput = z.infer<typeof productCreateSchema>;
export declare const categoryCreateSchema: z.ZodObject<{
    name: z.ZodString;
    slug: z.ZodString;
    description: z.ZodOptional<z.ZodString>;
    image: z.ZodOptional<z.ZodString>;
    isActive: z.ZodDefault<z.ZodBoolean>;
    displayOrder: z.ZodDefault<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    name: string;
    slug: string;
    isActive: boolean;
    displayOrder: number;
    description?: string | undefined;
    image?: string | undefined;
}, {
    name: string;
    slug: string;
    description?: string | undefined;
    isActive?: boolean | undefined;
    image?: string | undefined;
    displayOrder?: number | undefined;
}>;
export type CategoryCreateInput = z.infer<typeof categoryCreateSchema>;
export declare const supplierCreateSchema: z.ZodObject<{
    businessName: z.ZodString;
    contactName: z.ZodString;
    phone: z.ZodString;
    email: z.ZodUnion<[z.ZodOptional<z.ZodString>, z.ZodLiteral<"">]>;
    city: z.ZodString;
    address: z.ZodOptional<z.ZodString>;
    fulfilmentTerms: z.ZodOptional<z.ZodString>;
    returnPolicy: z.ZodOptional<z.ZodString>;
    payoutTerms: z.ZodOptional<z.ZodString>;
    isActive: z.ZodDefault<z.ZodBoolean>;
    notes: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    phone: string;
    city: string;
    isActive: boolean;
    businessName: string;
    contactName: string;
    notes?: string | undefined;
    email?: string | undefined;
    address?: string | undefined;
    fulfilmentTerms?: string | undefined;
    returnPolicy?: string | undefined;
    payoutTerms?: string | undefined;
}, {
    phone: string;
    city: string;
    businessName: string;
    contactName: string;
    notes?: string | undefined;
    isActive?: boolean | undefined;
    email?: string | undefined;
    address?: string | undefined;
    fulfilmentTerms?: string | undefined;
    returnPolicy?: string | undefined;
    payoutTerms?: string | undefined;
}>;
export type SupplierCreateInput = z.infer<typeof supplierCreateSchema>;
export declare const updateOrderStatusSchema: z.ZodObject<{
    status: z.ZodEnum<["pending_confirmation", "confirmed", "processing", "sent_to_supplier", "dispatched", "delivered", "delivery_failed", "returned", "cancelled"]>;
    paymentStatus: z.ZodOptional<z.ZodEnum<["unpaid", "cod_collected", "partially_settled", "settled", "refunded"]>>;
    reason: z.ZodOptional<z.ZodString>;
    notes: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    status: "pending_confirmation" | "confirmed" | "processing" | "sent_to_supplier" | "dispatched" | "delivered" | "delivery_failed" | "returned" | "cancelled";
    notes?: string | undefined;
    paymentStatus?: "unpaid" | "cod_collected" | "partially_settled" | "settled" | "refunded" | undefined;
    reason?: string | undefined;
}, {
    status: "pending_confirmation" | "confirmed" | "processing" | "sent_to_supplier" | "dispatched" | "delivered" | "delivery_failed" | "returned" | "cancelled";
    notes?: string | undefined;
    paymentStatus?: "unpaid" | "cod_collected" | "partially_settled" | "settled" | "refunded" | undefined;
    reason?: string | undefined;
}>;
export type UpdateOrderStatusInput = z.infer<typeof updateOrderStatusSchema>;
export declare const createFulfilmentSchema: z.ZodObject<{
    supplierId: z.ZodString;
    supplierOrderRef: z.ZodOptional<z.ZodString>;
    courierName: z.ZodOptional<z.ZodString>;
    trackingNumber: z.ZodOptional<z.ZodString>;
    trackingUrl: z.ZodUnion<[z.ZodOptional<z.ZodString>, z.ZodLiteral<"">]>;
    courierChargePkr: z.ZodDefault<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    supplierId: string;
    courierChargePkr: number;
    supplierOrderRef?: string | undefined;
    courierName?: string | undefined;
    trackingNumber?: string | undefined;
    trackingUrl?: string | undefined;
}, {
    supplierId: string;
    supplierOrderRef?: string | undefined;
    courierName?: string | undefined;
    trackingNumber?: string | undefined;
    trackingUrl?: string | undefined;
    courierChargePkr?: number | undefined;
}>;
export type CreateFulfilmentInput = z.infer<typeof createFulfilmentSchema>;
export declare const updateFulfilmentSchema: z.ZodObject<{
    status: z.ZodEnum<["unassigned", "assigned", "sent_to_supplier", "dispatched", "delivered", "failed", "returned"]>;
    courierName: z.ZodOptional<z.ZodString>;
    trackingNumber: z.ZodOptional<z.ZodString>;
    failureReason: z.ZodOptional<z.ZodString>;
    courierChargePkr: z.ZodOptional<z.ZodNumber>;
    returnChargePkr: z.ZodOptional<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    status: "sent_to_supplier" | "dispatched" | "delivered" | "returned" | "unassigned" | "assigned" | "failed";
    courierName?: string | undefined;
    trackingNumber?: string | undefined;
    courierChargePkr?: number | undefined;
    failureReason?: string | undefined;
    returnChargePkr?: number | undefined;
}, {
    status: "sent_to_supplier" | "dispatched" | "delivered" | "returned" | "unassigned" | "assigned" | "failed";
    courierName?: string | undefined;
    trackingNumber?: string | undefined;
    courierChargePkr?: number | undefined;
    failureReason?: string | undefined;
    returnChargePkr?: number | undefined;
}>;
export type UpdateFulfilmentInput = z.infer<typeof updateFulfilmentSchema>;
export declare const createFinancialTransactionSchema: z.ZodObject<{
    transactionType: z.ZodEnum<["cod_collection", "supplier_payout", "courier_fee", "return_loss", "refund", "adjustment"]>;
    amountPkr: z.ZodNumber;
    referenceNumber: z.ZodOptional<z.ZodString>;
    status: z.ZodDefault<z.ZodEnum<["pending", "completed", "cancelled"]>>;
    notes: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    status: "cancelled" | "pending" | "completed";
    transactionType: "cod_collection" | "supplier_payout" | "courier_fee" | "return_loss" | "refund" | "adjustment";
    amountPkr: number;
    notes?: string | undefined;
    referenceNumber?: string | undefined;
}, {
    transactionType: "cod_collection" | "supplier_payout" | "courier_fee" | "return_loss" | "refund" | "adjustment";
    amountPkr: number;
    status?: "cancelled" | "pending" | "completed" | undefined;
    notes?: string | undefined;
    referenceNumber?: string | undefined;
}>;
export type CreateFinancialTransactionInput = z.infer<typeof createFinancialTransactionSchema>;
export declare const updateSettingsSchema: z.ZodObject<{
    storeName: z.ZodString;
    tagline: z.ZodDefault<z.ZodString>;
    whatsappNumber: z.ZodString;
    supportEmail: z.ZodUnion<[z.ZodString, z.ZodString]>;
    supportPhone: z.ZodDefault<z.ZodString>;
    currency: z.ZodDefault<z.ZodString>;
    defaultDeliveryChargePkr: z.ZodDefault<z.ZodNumber>;
    freeDeliveryThresholdPkr: z.ZodDefault<z.ZodNumber>;
    estimatedDeliveryDays: z.ZodDefault<z.ZodString>;
    codTerms: z.ZodDefault<z.ZodString>;
    returnPolicySummary: z.ZodDefault<z.ZodString>;
    aboutText: z.ZodDefault<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    storeName: string;
    tagline: string;
    whatsappNumber: string;
    supportEmail: string;
    supportPhone: string;
    currency: string;
    defaultDeliveryChargePkr: number;
    freeDeliveryThresholdPkr: number;
    estimatedDeliveryDays: string;
    codTerms: string;
    returnPolicySummary: string;
    aboutText: string;
}, {
    storeName: string;
    whatsappNumber: string;
    supportEmail: string;
    tagline?: string | undefined;
    supportPhone?: string | undefined;
    currency?: string | undefined;
    defaultDeliveryChargePkr?: number | undefined;
    freeDeliveryThresholdPkr?: number | undefined;
    estimatedDeliveryDays?: string | undefined;
    codTerms?: string | undefined;
    returnPolicySummary?: string | undefined;
    aboutText?: string | undefined;
}>;
export type UpdateSettingsInput = z.infer<typeof updateSettingsSchema>;
//# sourceMappingURL=index.d.ts.map