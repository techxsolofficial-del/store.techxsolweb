# Database Schema Reference
## Pakistan Dropshipping Platform (Supabase PostgreSQL)

---

## 1. Overview of Tables

All monetary columns store integer amounts in Pakistani Rupees (`PKR`) to eliminate floating point inaccuracies.

| Table Name | Description | RLS Policy |
| :--- | :--- | :--- |
| `profiles` | System users (Admins and Staff) | Admin Only |
| `categories` | Product departments (slug, name, display order) | Public Read (Active) / Admin Write |
| `suppliers` | Wholesale dropshipping supplier partners | Admin Only (Protects wholesale source) |
| `products` | Published products, variants, images, prices | Public Read (Active) / Admin Write |
| `product_supplier_offers` | Multi-supplier wholesale cost mapping | Admin Only (Protects profit margins) |
| `customers` | Customer names, phone numbers, addresses | Admin Only |
| `orders` | Transactional orders, status, totals, profit | Admin Only / Redacted Public Tracking |
| `order_items` | Historical price and cost snapshot | Admin Only |
| `fulfilments` | Supplier assignments and courier tracking | Admin Only / Redacted Public Tracking |
| `order_status_history` | Audit log of all lifecycle transitions | Admin Only / Redacted Timeline |
| `financial_transactions` | Cash collection, supplier payouts, courier fees | Admin Only |
| `store_settings` | Brand name, WhatsApp number, delivery fees | Public Read (Public keys) / Admin Write |
| `audit_logs` | Administrative changes and system events | Admin Only |

---

## 2. Key Foreign Keys & Constraints

- `products.category_id` $\to$ `categories.id` (`ON DELETE RESTRICT`)
- `product_supplier_offers.product_id` $\to$ `products.id` (`ON DELETE CASCADE`)
- `product_supplier_offers.supplier_id` $\to$ `suppliers.id` (`ON DELETE RESTRICT`)
- `orders.customer_id` $\to$ `customers.id` (`ON DELETE RESTRICT`)
- `order_items.order_id` $\to$ `orders.id` (`ON DELETE CASCADE`)
- `fulfilments.order_id` $\to$ `orders.id` (`ON DELETE CASCADE`)
- `fulfilments.supplier_id` $\to$ `suppliers.id` (`ON DELETE RESTRICT`)
- `financial_transactions.order_id` $\to$ `orders.id` (`ON DELETE CASCADE`)
- `order_status_history.order_id` $\to$ `orders.id` (`ON DELETE CASCADE`)

---

## 3. Order Status & Financial Status Enums

### Order Statuses
- `pending_confirmation`: New order placed on website or entered from WhatsApp. Awaiting telephone confirmation with customer.
- `confirmed`: Customer verified address and phone number. Ready for supplier dispatch.
- `processing`: Order forwarded to dropshipping supplier.
- `sent_to_supplier`: Dropshipper packaging parcel.
- `dispatched`: Handed over to courier (Trax, Leopards, TCS, Call Courier) with tracking number.
- `delivered`: Courier rider delivered parcel and collected COD cash.
- `delivery_failed`: Courier unable to deliver (customer unreachable, refused parcel, incorrect address).
- `returned`: Parcel returned to origin warehouse. Return shipping loss incurred.
- `cancelled`: Order cancelled before dispatch.

### Payment Statuses
- `unpaid`: COD parcel in transit; cash not yet collected.
- `cod_collected`: Courier delivery officer collected cash from customer.
- `partially_settled`: Courier remitted partial payment or deducted shipping fees.
- `settled`: Final funds deposited into store owner's bank account.
- `refunded`: Customer refunded following return or damage claim.

