/**
 * Formats an integer amount in PKR as a Pakistani Rupee currency string
 * e.g., 2500 -> "Rs. 2,500"
 */
export function formatPkr(amount: number): string {
  const rounded = Math.round(amount || 0);
  return `Rs. ${rounded.toLocaleString('en-PK')}`;
}

/**
 * Normalizes any variation of a Pakistani mobile number into clean 03XXXXXXXXX or 923XXXXXXXXX format
 */
export function normalizePakistanPhone(phone: string, targetFormat: 'local' | 'international' = 'local'): string {
  if (!phone) return '';
  // Strip all non-digit characters
  const digits = phone.replace(/\D/g, '');

  let basePhone = digits;
  if (basePhone.startsWith('0092')) {
    basePhone = basePhone.substring(4);
  } else if (basePhone.startsWith('92')) {
    basePhone = basePhone.substring(2);
  } else if (basePhone.startsWith('0')) {
    basePhone = basePhone.substring(1);
  }

  // basePhone should now be 3XXXXXXXXX (10 digits)
  if (targetFormat === 'international') {
    return `92${basePhone}`;
  }
  return `0${basePhone}`;
}

/**
 * Masks phone number for privacy in public order tracking
 * e.g. 03001234567 -> 0300****567
 */
export function maskPhoneNumber(phone: string): string {
  const norm = normalizePakistanPhone(phone, 'local');
  if (norm.length >= 10) {
    return `${norm.slice(0, 4)}****${norm.slice(-3)}`;
  }
  return '****';
}

/**
 * Masks detailed street addresses to protect customer privacy on public tracking
 */
export function maskAddress(address: string, city: string): string {
  if (!address) return city;
  const parts = address.split(',').map((p) => p.trim()).filter(Boolean);
  if (parts.length > 1) {
    return `***, ${parts.slice(1).join(', ')}`;
  }
  return `***, ${city}`;
}

/**
 * Generates human-friendly, unique order reference
 * format: ORD-YYYYMMDD-XXXX
 */
export function generateOrderReference(): string {
  const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const randomChars = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `ORD-${dateStr}-${randomChars}`;
}

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
export function buildWhatsAppOrderLink(params: WhatsAppOrderMessageParams): string {
  const cleanPhone = normalizePakistanPhone(params.businessPhone, 'international');

  let message = `*Assalam-o-Alaikum!*\nI would like to place an order via Cash on Delivery:\n\n`;

  if (params.orderReference) {
    message += `*Order Reference:* ${params.orderReference}\n`;
  }

  message += `*Items Ordered:*\n`;
  params.items.forEach((item, idx) => {
    const variant = item.variantName ? ` (${item.variantName})` : '';
    message += `${idx + 1}. ${item.name}${variant}\n   Qty: ${item.quantity} x ${formatPkr(item.unitPricePkr)} = ${formatPkr(item.quantity * item.unitPricePkr)}\n`;
  });

  message += `\n*Subtotal:* ${formatPkr(params.subtotalPkr)}\n`;
  message += `*Estimated Delivery:* ${params.deliveryChargePkr > 0 ? formatPkr(params.deliveryChargePkr) : 'FREE'}\n`;
  message += `*Total Payable (COD):* ${formatPkr(params.totalPkr)}\n\n`;

  if (params.customerName || params.city) {
    message += `*Customer Details:*\n`;
    if (params.customerName) message += `Name: ${params.customerName}\n`;
    if (params.city) message += `City: ${params.city}\n`;
    message += `\n`;
  }

  message += `Please confirm product availability and dispatch details. JazakAllah!`;

  return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;
}

/**
 * Single product direct WhatsApp inquiry link
 */
export function buildSingleProductWhatsAppLink(params: {
  businessPhone: string;
  productName: string;
  pricePkr: number;
  productUrl?: string;
}): string {
  const cleanPhone = normalizePakistanPhone(params.businessPhone, 'international');
  let text = `*Assalam-o-Alaikum!*\nI am interested in ordering: *${params.productName}*\nPrice: ${formatPkr(params.pricePkr)}\nPayment: Cash on Delivery (COD)\n`;
  if (params.productUrl) {
    text += `Link: ${params.productUrl}\n`;
  }
  text += `\nPlease let me know if it is available and the delivery time for my city.`;
  return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(text)}`;
}

