-- ==============================================================================
-- 001_initial_schema.sql
-- Pakistan Dropshipping Ecommerce Platform Initial Schema
-- All monetary fields stored in INTEGER minor units representing PKR (Pakistani Rupees)
-- ==============================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Profiles (Linked to Supabase Auth or Local Admin)
CREATE TABLE IF NOT EXISTS profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) NOT NULL UNIQUE,
    display_name VARCHAR(150) NOT NULL,
    role VARCHAR(50) NOT NULL DEFAULT 'staff' CHECK (role IN ('admin', 'staff')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. Categories
CREATE TABLE IF NOT EXISTS categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL,
    slug VARCHAR(120) NOT NULL UNIQUE,
    description TEXT,
    image_url TEXT,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    display_order INT NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_categories_slug ON categories(slug);
CREATE INDEX IF NOT EXISTS idx_categories_active ON categories(is_active);

-- 3. Suppliers (Dropshipping Partners)
CREATE TABLE IF NOT EXISTS suppliers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    business_name VARCHAR(150) NOT NULL,
    contact_name VARCHAR(100) NOT NULL,
    phone VARCHAR(50) NOT NULL,
    email VARCHAR(255),
    city VARCHAR(100) NOT NULL DEFAULT 'Lahore',
    address TEXT,
    fulfilment_terms TEXT,
    return_policy TEXT,
    payout_terms TEXT,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_suppliers_active ON suppliers(is_active);

-- 4. Products
CREATE TABLE IF NOT EXISTS products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    category_id UUID NOT NULL REFERENCES categories(id) ON DELETE RESTRICT,
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) NOT NULL UNIQUE,
    short_description VARCHAR(300) NOT NULL,
    description TEXT NOT NULL,
    base_price_pkr INT NOT NULL CHECK (base_price_pkr >= 0),
    compare_at_price_pkr INT CHECK (compare_at_price_pkr >= base_price_pkr),
    sku VARCHAR(100) NOT NULL UNIQUE,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    is_featured BOOLEAN NOT NULL DEFAULT FALSE,
    images JSONB NOT NULL DEFAULT '[]'::JSONB,
    variants JSONB NOT NULL DEFAULT '[]'::JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_products_slug ON products(slug);
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_active ON products(is_active);
CREATE INDEX IF NOT EXISTS idx_products_featured ON products(is_featured);

-- 5. Product Supplier Offers (Multi-supplier cost and availability mapping)
CREATE TABLE IF NOT EXISTS product_supplier_offers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    supplier_id UUID NOT NULL REFERENCES suppliers(id) ON DELETE RESTRICT,
    supplier_sku VARCHAR(100) NOT NULL,
    supplier_cost_pkr INT NOT NULL CHECK (supplier_cost_pkr >= 0),
    is_available BOOLEAN NOT NULL DEFAULT TRUE,
    lead_time_days INT NOT NULL DEFAULT 2 CHECK (lead_time_days >= 0),
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_product_supplier UNIQUE(product_id, supplier_id)
);

CREATE INDEX IF NOT EXISTS idx_offers_product ON product_supplier_offers(product_id);
CREATE INDEX IF NOT EXISTS idx_offers_supplier ON product_supplier_offers(supplier_id);

-- 6. Customers
CREATE TABLE IF NOT EXISTS customers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(150) NOT NULL,
    phone VARCHAR(50) NOT NULL,
    alternate_phone VARCHAR(50),
    city VARCHAR(100) NOT NULL,
    delivery_address TEXT NOT NULL,
    delivery_instructions TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_customers_phone ON customers(phone);
CREATE INDEX IF NOT EXISTS idx_customers_city ON customers(city);

-- 7. Orders
CREATE TABLE IF NOT EXISTS orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_reference VARCHAR(50) NOT NULL UNIQUE,
    tracking_token VARCHAR(100) NOT NULL UNIQUE,
    customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE RESTRICT,
    source_channel VARCHAR(30) NOT NULL DEFAULT 'website' CHECK (source_channel IN ('website', 'whatsapp')),
    order_status VARCHAR(50) NOT NULL DEFAULT 'pending_confirmation' CHECK (
        order_status IN (
            'pending_confirmation', 'confirmed', 'processing',
            'sent_to_supplier', 'dispatched', 'delivered',
            'delivery_failed', 'returned', 'cancelled'
        )
    ),
    payment_method VARCHAR(30) NOT NULL DEFAULT 'cod' CHECK (payment_method IN ('cod')),
    payment_status VARCHAR(50) NOT NULL DEFAULT 'unpaid' CHECK (
        payment_status IN ('unpaid', 'cod_collected', 'partially_settled', 'settled', 'refunded')
    ),
    subtotal_pkr INT NOT NULL CHECK (subtotal_pkr >= 0),
    delivery_charge_pkr INT NOT NULL DEFAULT 0 CHECK (delivery_charge_pkr >= 0),
    discount_pkr INT NOT NULL DEFAULT 0 CHECK (discount_pkr >= 0),
    total_payable_pkr INT NOT NULL CHECK (total_payable_pkr >= 0),
    estimated_profit_pkr INT NOT NULL DEFAULT 0,
    actual_profit_pkr INT NOT NULL DEFAULT 0,
    internal_notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_orders_reference ON orders(order_reference);
CREATE INDEX IF NOT EXISTS idx_orders_customer ON orders(customer_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(order_status);
CREATE INDEX IF NOT EXISTS idx_orders_payment_status ON orders(payment_status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at DESC);

-- 8. Order Items (Historical immutable price & cost snapshot)
CREATE TABLE IF NOT EXISTS order_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    product_id UUID REFERENCES products(id) ON DELETE SET NULL,
    product_name_snapshot VARCHAR(255) NOT NULL,
    variant_snapshot JSONB,
    image_snapshot TEXT,
    quantity INT NOT NULL CHECK (quantity > 0),
    unit_price_pkr INT NOT NULL CHECK (unit_price_pkr >= 0),
    supplier_cost_pkr INT NOT NULL DEFAULT 0 CHECK (supplier_cost_pkr >= 0),
    total_price_pkr INT NOT NULL CHECK (total_price_pkr >= 0),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_order_items_order ON order_items(order_id);

-- 9. Fulfilments (Dropshipping tracking & courier assignments)
CREATE TABLE IF NOT EXISTS fulfilments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    supplier_id UUID NOT NULL REFERENCES suppliers(id) ON DELETE RESTRICT,
    supplier_order_ref VARCHAR(100),
    courier_name VARCHAR(100),
    tracking_number VARCHAR(100),
    tracking_url TEXT,
    status VARCHAR(50) NOT NULL DEFAULT 'assigned' CHECK (
        status IN ('unassigned', 'assigned', 'sent_to_supplier', 'dispatched', 'delivered', 'failed', 'returned')
    ),
    dispatched_at TIMESTAMPTZ,
    delivered_at TIMESTAMPTZ,
    failure_reason TEXT,
    courier_charge_pkr INT NOT NULL DEFAULT 0 CHECK (courier_charge_pkr >= 0),
    return_charge_pkr INT NOT NULL DEFAULT 0 CHECK (return_charge_pkr >= 0),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_fulfilments_order ON fulfilments(order_id);
CREATE INDEX IF NOT EXISTS idx_fulfilments_supplier ON fulfilments(supplier_id);
CREATE INDEX IF NOT EXISTS idx_fulfilments_tracking ON fulfilments(tracking_number);

-- 10. Order Status History (Audit trail of every state transition)
CREATE TABLE IF NOT EXISTS order_status_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    previous_status VARCHAR(50),
    new_status VARCHAR(50) NOT NULL,
    actor_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    actor_name VARCHAR(100),
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_order_history_order ON order_status_history(order_id);

-- 11. Financial Transactions (COD Ledger & Reconciliation)
CREATE TABLE IF NOT EXISTS financial_transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    transaction_type VARCHAR(50) NOT NULL CHECK (
        transaction_type IN ('cod_collection', 'supplier_payout', 'courier_fee', 'return_loss', 'refund', 'adjustment')
    ),
    amount_pkr INT NOT NULL CHECK (amount_pkr > 0),
    reference_number VARCHAR(100),
    status VARCHAR(50) NOT NULL DEFAULT 'completed' CHECK (status IN ('pending', 'completed', 'cancelled')),
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_transactions_order ON financial_transactions(order_id);
CREATE INDEX IF NOT EXISTS idx_transactions_type ON financial_transactions(transaction_type);

-- 12. Store Settings (Key-Value configuration)
CREATE TABLE IF NOT EXISTS store_settings (
    key VARCHAR(100) PRIMARY KEY,
    value JSONB NOT NULL,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 13. Audit Logs (Administrative action logs)
CREATE TABLE IF NOT EXISTS audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    actor_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    action VARCHAR(100) NOT NULL,
    entity_type VARCHAR(50) NOT NULL,
    entity_id VARCHAR(100) NOT NULL,
    metadata JSONB DEFAULT '{}'::JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_audit_logs_created ON audit_logs(created_at DESC);

