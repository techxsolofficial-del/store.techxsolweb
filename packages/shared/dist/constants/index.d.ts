export declare const ORDER_STATUSES: readonly ["pending_confirmation", "confirmed", "processing", "sent_to_supplier", "dispatched", "delivered", "delivery_failed", "returned", "cancelled"];
export type OrderStatus = (typeof ORDER_STATUSES)[number];
export declare const ORDER_STATUS_LABELS: Record<OrderStatus, string>;
export declare const PAYMENT_STATUSES: readonly ["unpaid", "cod_collected", "partially_settled", "settled", "refunded"];
export type PaymentStatus = (typeof PAYMENT_STATUSES)[number];
export declare const PAYMENT_STATUS_LABELS: Record<PaymentStatus, string>;
export declare const ORDER_SOURCE_CHANNELS: readonly ["website", "whatsapp"];
export type OrderSourceChannel = (typeof ORDER_SOURCE_CHANNELS)[number];
export declare const PAYMENT_METHODS: readonly ["cod"];
export type PaymentMethod = (typeof PAYMENT_METHODS)[number];
export declare const FULFILMENT_STATUSES: readonly ["unassigned", "assigned", "sent_to_supplier", "dispatched", "delivered", "failed", "returned"];
export type FulfilmentStatus = (typeof FULFILMENT_STATUSES)[number];
export declare const PAKISTAN_CITIES: readonly ["Karachi", "Lahore", "Islamabad", "Rawalpindi", "Faisalabad", "Peshawar", "Multan", "Gujranwala", "Sialkot", "Hyderabad", "Quetta", "Bahawalpur", "Sargodha", "Abbottabad", "Sukkur", "Larkana", "Sheikhupura", "Rahim Yar Khan", "Jhang", "Dera Ghazi Khan", "Gujrat", "Sahiwal", "Wah Cantt", "Mardan", "Kasur", "Okara", "Mingora", "Nawabshah", "Chiniot", "Kotri", "Kamoke", "Hafizabad", "Sadiqabad", "Mirpur Khas", "Burewala", "Kohat", "Khanewal", "Dera Ismail Khan", "Turbat", "Muzaffargarh", "Mandi Bahauddin", "Shikarpur", "Jacobabad", "Jhelum", "Khanpur", "Khairpur", "Khuzdar", "Pakpattan", "Hub", "Daska", "Gojra", "Muridke", "Bahawalnagar", "Samundri", "Jaranwala", "Chishtian", "Attock", "Vehari", "Kot Abdul Malik", "Ferozwala", "Chakwal", "Gujar Khan", "Kamalia", "Umerkot", "Ahmedpur East", "Kot Addu", "Wazirabad", "Mansehra", "Layyah", "Mirpur (AJK)", "Muzaffarabad (AJK)"];
export declare const PAKISTAN_PHONE_REGEX: RegExp;
export declare const DEFAULT_STORE_SETTINGS: {
    store_name: string;
    tagline: string;
    whatsapp_number: string;
    support_email: string;
    support_phone: string;
    currency: string;
    default_delivery_charge_pkr: number;
    free_delivery_threshold_pkr: number;
    estimated_delivery_days: string;
    cod_terms: string;
    return_window_days: number;
};
//# sourceMappingURL=index.d.ts.map