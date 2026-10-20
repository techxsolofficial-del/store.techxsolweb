-- ==============================================================================
-- seed_data.sql
-- Realistic Pakistan Dropshipping Demo Seed Data
-- ==============================================================================

-- 1. Categories
INSERT INTO categories (id, name, slug, description, image_url, is_active, display_order)
VALUES
    ('c1111111-1111-1111-1111-111111111111', 'Smart Gadgets & Audio', 'smart-gadgets', 'High-demand wireless earbuds, smartwatches, and smartphone accessories.', 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&auto=format&fit=crop&q=80', TRUE, 1),
    ('c2222222-2222-2222-2222-222222222222', 'Home & Kitchen Gadgets', 'home-kitchen', 'Time-saving kitchen gadgets and home organizers for modern Pakistani households.', 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?w=600&auto=format&fit=crop&q=80', TRUE, 2),
    ('c3333333-3333-3333-3333-333333333333', 'Personal Care & Grooming', 'personal-care', 'Electric shavers, facial care devices, and wellness tools.', 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=600&auto=format&fit=crop&q=80', TRUE, 3)
ON CONFLICT (id) DO NOTHING;

-- 2. Suppliers
INSERT INTO suppliers (id, business_name, contact_name, phone, email, city, address, fulfilment_terms, return_policy, payout_terms, is_active, notes)
VALUES
    ('s1111111-1111-1111-1111-111111111111', 'Shah Alam Wholesale Hub', 'Mian Tariq', '03008451122', 'tariq@shahalamhub.pk', 'Lahore', 'Shop # 45, Hall Road / Shah Alam Market, Lahore', 'Dispatches same-day if order confirmed before 2:00 PM. Uses Trax and Call Courier.', '7 days replacement warranty for dead-on-arrival electronics.', 'Weekly bank settlement every Monday after courier COD remittance.', TRUE, 'Primary supplier for audio and electronics.'),
    ('s2222222-2222-2222-2222-222222222222', 'Bolton Market Imports', 'Muhammad Asif', '03212894567', 'asif@boltonimports.pk', 'Karachi', 'Plaza 12, Bolton Market, Karachi', 'Next-day dispatch. Operates directly with TCS & Leopards.', 'Replacement if reported within 5 days of delivery with parcel unboxing video.', '10 days credit cycle.', TRUE, 'Best wholesale rates for kitchen and home tools.')
ON CONFLICT (id) DO NOTHING;

-- 3. Products
INSERT INTO products (id, category_id, name, slug, short_description, description, base_price_pkr, compare_at_price_pkr, sku, is_active, is_featured, images, variants)
VALUES
    (
        'p1111111-1111-1111-1111-111111111111',
        'c1111111-1111-1111-1111-111111111111',
        'AeroPods Pro Wireless Earbuds with ANC & Deep Bass',
        'aeropods-pro-wireless-earbuds',
        'True Wireless Bluetooth 5.3 earbuds with Active Noise Cancellation and 28-hour playtime.',
        'Experience crisp, studio-grade acoustics and rich bass with the AeroPods Pro. Designed for high performance, these wireless earbuds feature smart touch controls, IPX5 water resistance for workouts, low latency gaming mode, and seamless instant pairing with all Android and iPhone devices across Pakistan. Package includes charging case, Type-C cable, and 3 ear tip sizes.',
        2999,
        4500,
        'AP-PRO-BLK',
        TRUE,
        TRUE,
        '[
            {"id": "img-1", "url": "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=800&auto=format&fit=crop&q=80", "isPrimary": true, "altText": "AeroPods Pro Black Charging Case"},
            {"id": "img-2", "url": "https://images.unsplash.com/photo-1606220588913-b3aacb4d2f46?w=800&auto=format&fit=crop&q=80", "isPrimary": false, "altText": "AeroPods In-Ear Close-up"}
        ]'::JSONB,
        '[
            {"id": "v-blk", "name": "Matte Black", "sku": "AP-PRO-BLK", "priceDeltaPkr": 0, "isAvailable": true},
            {"id": "v-wht", "name": "Glossy White", "sku": "AP-PRO-WHT", "priceDeltaPkr": 0, "isAvailable": true}
        ]'::JSONB
    ),
    (
        'p2222222-2222-2222-2222-222222222222',
        'c2222222-2222-2222-2222-222222222222',
        '14-in-1 Multifunction Vegetable & Onion Chopper',
        '14-in-1-multifunction-vegetable-chopper',
        'Premium stainless-steel blade vegetable chopper with container and hand protector.',
        'Cut meal prep time by 70%. This heavy-duty 14-in-1 kitchen mandoline dicer effortlessly chops onions, potatoes, tomatoes, and vegetables with zero eye irritation. Features 8 interchangeable 420-grade stainless steel blades, large 1.5L BPA-free catch container, drain basket, and ergonomic safety pusher.',
        1950,
        2800,
        'KIT-CHOP-14',
        TRUE,
        TRUE,
        '[
            {"id": "img-3", "url": "https://images.unsplash.com/photo-1584990347449-39906f3630f5?w=800&auto=format&fit=crop&q=80", "isPrimary": true, "altText": "Multifunction Vegetable Chopper Kit"}
        ]'::JSONB,
        '[
            {"id": "v-grn", "name": "Classic Forest Green", "sku": "KIT-CHOP-GRN", "priceDeltaPkr": 0, "isAvailable": true},
            {"id": "v-gry", "name": "Modern Slate Grey", "sku": "KIT-CHOP-GRY", "priceDeltaPkr": 0, "isAvailable": true}
        ]'::JSONB
    ),
    (
        'p3333333-3333-3333-3333-333333333333',
        'c3333333-3333-3333-3333-333333333333',
        'Rechargeable Vintage T9 Hair & Beard Trimmer',
        'vintage-t9-rechargeable-hair-trimmer',
        'All-metal cordless zero-gapped precision detailer with USB rechargeable battery.',
        'Engineered for professional barbers and home grooming, the Vintage T9 features a high-torque rotary motor, titanium coated T-blade for ultra-sharp lining, 1200mAh battery providing 180 minutes of runtime, and 4 attachment combs (1.5mm, 2mm, 3mm, 4mm).',
        1699,
        2400,
        'TRIM-T9-GOLD',
        TRUE,
        TRUE,
        '[
            {"id": "img-4", "url": "https://images.unsplash.com/photo-1621607512214-68297480165e?w=800&auto=format&fit=crop&q=80", "isPrimary": true, "altText": "Vintage T9 Cordless Trimmer Gold"}
        ]'::JSONB,
        '[
            {"id": "v-gold", "name": "Dragon Gold Edition", "sku": "TRIM-T9-GLD", "priceDeltaPkr": 0, "isAvailable": true},
            {"id": "v-blk-trim", "name": "Stealth Black Edition", "sku": "TRIM-T9-BLK", "priceDeltaPkr": 0, "isAvailable": true}
        ]'::JSONB
    ),
    (
        'p4444444-4444-4444-4444-444444444444',
        'c1111111-1111-1111-1111-111111111111',
        'Smart Fitness Tracker Watch with Blood Pressure & Heart Rate',
        'smart-fitness-tracker-watch',
        'Waterproof health smartwatch with 1.4-inch HD display, sleep monitor, and WhatsApp call alerts.',
        'Stay on top of your fitness journey with 24/7 pulse tracking, step counter, blood oxygen saturation monitor, sleep analysis, and instant WhatsApp / SMS vibration alerts. Magnetic fast charger included. Up to 7 days standby.',
        2499,
        3800,
        'SW-FIT-01',
        TRUE,
        FALSE,
        '[
            {"id": "img-5", "url": "https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?w=800&auto=format&fit=crop&q=80", "isPrimary": true, "altText": "Smartwatch Fitness Tracker"}
        ]'::JSONB,
        '[
            {"id": "v-sw-blk", "name": "Silicone Black Strap", "sku": "SW-FIT-BLK", "priceDeltaPkr": 0, "isAvailable": true},
            {"id": "v-sw-blu", "name": "Navy Blue Strap", "sku": "SW-FIT-BLU", "priceDeltaPkr": 0, "isAvailable": true}
        ]'::JSONB
    )
ON CONFLICT (id) DO NOTHING;

-- 4. Product Supplier Offers (Dropshipping Cost Snapshot)
INSERT INTO product_supplier_offers (product_id, supplier_id, supplier_sku, supplier_cost_pkr, is_available, lead_time_days, notes)
VALUES
    ('p1111111-1111-1111-1111-111111111111', 's1111111-1111-1111-1111-111111111111', 'SA-EAR-PRO', 1650, TRUE, 1, 'In stock. Wholesale bulk tier.'),
    ('p2222222-2222-2222-2222-222222222222', 's2222222-2222-2222-2222-222222222222', 'BM-CHOP-14', 1050, TRUE, 2, 'Reliable packaging. Boxed with unboxing seal.'),
    ('p3333333-3333-3333-3333-333333333333', 's1111111-1111-1111-1111-111111111111', 'SA-TRIM-T9', 850, TRUE, 1, 'Includes lubricant oil and cleaning brush.'),
    ('p4444444-4444-4444-4444-444444444444', 's1111111-1111-1111-1111-111111111111', 'SA-WATCH-FIT', 1350, TRUE, 1, 'Ready for dispatch.')
ON CONFLICT (product_id, supplier_id) DO NOTHING;

-- 5. Store Settings
INSERT INTO store_settings (key, value)
VALUES
    ('store_info', '{
        "storeName": "BazaarPK Direct",
        "tagline": "Premium Lifestyle & Gadgets - Cash on Delivery Across Pakistan",
        "whatsappNumber": "923001234567",
        "supportEmail": "support@bazaarpk.com",
        "supportPhone": "0300 1234567",
        "currency": "PKR",
        "defaultDeliveryChargePkr": 250,
        "freeDeliveryThresholdPkr": 3500,
        "estimatedDeliveryDays": "2 to 4 business days",
        "codTerms": "Inspect parcel seal and pay cash directly to the courier delivery officer upon arrival.",
        "returnPolicySummary": "7-day easy replacement policy for damaged or defective products upon unboxing.",
        "aboutText": "BazaarPK Direct is a modern Pakistani ecommerce storefront providing verified lifestyle gadgets, kitchen tools, and smart devices with nationwide fast Cash on Delivery."
    }'::JSONB)
ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value;

