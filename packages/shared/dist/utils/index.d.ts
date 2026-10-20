/**
 * Formats an integer amount in PKR as a Pakistani Rupee currency string
 * e.g., 2500 -> "Rs. 2,500"
 */
export declare function formatPkr(amount: number): string;
/**
 * Normalizes any variation of a Pakistani mobile number into clean 03XXXXXXXXX or 923XXXXXXXXX format
 */
export declare function normalizePakistanPhone(phone: string, targetFormat?: 'local' | 'international'): string;
/**
 * Masks phone number for privacy in public order tracking
 * e.g. 03001234567 -> 0300****567
 */
export declare function maskPhoneNumber(phone: string): string;
/**
 * Masks detailed street addresses to protect customer privacy on public tracking
 */
export declare function maskAddress(address: string, city: string): string;
/**
 * Generates human-friendly, unique order reference
 * format: ORD-YYYYMMDD-XXXX
 */
export declare function generateOrderReference(): string;
export interface WhatsAppOrderMessageParams {
    businessPhone: string;
    items: Array<{
        name: string;
        variantName?: string;
        quantity: number;
        unitPricePkr: number;
    }>;
    subtotalPkr: number;
    deliveryChargePkr: number;
    totalPkr: number;
    orderReference?: string;
    customerName?: string;
    city?: string;
}
/**
 * Generates an official WhatsApp click-to-chat URL with a pre-filled, readable order message
 */
export declare function buildWhatsAppOrderLink(params: WhatsAppOrderMessageParams): string;
/**
 * Single product direct WhatsApp inquiry link
 */
export declare function buildSingleProductWhatsAppLink(params: {
    businessPhone: string;
    productName: string;
    pricePkr: number;
    productUrl?: string;
}): string;
//# sourceMappingURL=index.d.ts.map