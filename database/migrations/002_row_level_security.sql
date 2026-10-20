-- ==============================================================================
-- 002_row_level_security.sql
-- Row Level Security (RLS) policies for Supabase PostgreSQL
-- ==============================================================================

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE suppliers ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_supplier_offers ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE fulfilments ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_status_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE financial_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE store_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Helper function to check if requesting user is admin
CREATE OR REPLACE FUNCTION auth.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN (
    coalesce(
      current_setting('request.jwt.claims', true)::jsonb -> 'user_metadata' ->> 'role',
      ''
    ) = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 1. Categories: Public can view active categories; Admin has full access
CREATE POLICY "Public can view active categories"
ON categories FOR SELECT
USING (is_active = TRUE);

CREATE POLICY "Admin full access on categories"
ON categories FOR ALL
USING (auth.is_admin());

-- 2. Products: Public can view active products; Admin has full access
CREATE POLICY "Public can view active products"
ON products FOR SELECT
USING (is_active = TRUE);

CREATE POLICY "Admin full access on products"
ON products FOR ALL
USING (auth.is_admin());

-- 3. Product Supplier Offers: Only admin can view and manage supplier costs
CREATE POLICY "Admin full access on product supplier offers"
ON product_supplier_offers FOR ALL
USING (auth.is_admin());

-- 4. Suppliers: Only admin can view and manage suppliers
CREATE POLICY "Admin full access on suppliers"
ON suppliers FOR ALL
USING (auth.is_admin());

-- 5. Store Settings: Public can view non-sensitive settings; Admin has full access
CREATE POLICY "Public can view public store settings"
ON store_settings FOR SELECT
USING (key IN ('public_config', 'store_info', 'delivery_charges'));

CREATE POLICY "Admin full access on store settings"
ON store_settings FOR ALL
USING (auth.is_admin());

-- 6. Orders & Customers & Fulfilments: Managed via Backend Service Role / Admin JWT
CREATE POLICY "Admin full access on customers"
ON customers FOR ALL
USING (auth.is_admin());

CREATE POLICY "Admin full access on orders"
ON orders FOR ALL
USING (auth.is_admin());

CREATE POLICY "Admin full access on order items"
ON order_items FOR ALL
USING (auth.is_admin());

CREATE POLICY "Admin full access on fulfilments"
ON fulfilments FOR ALL
USING (auth.is_admin());

CREATE POLICY "Admin full access on financial transactions"
ON financial_transactions FOR ALL
USING (auth.is_admin());

CREATE POLICY "Admin full access on order history"
ON order_status_history FOR ALL
USING (auth.is_admin());

CREATE POLICY "Admin full access on audit logs"
ON audit_logs FOR ALL
USING (auth.is_admin());

