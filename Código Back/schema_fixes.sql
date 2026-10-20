-- Moda Luxo — Schema Fixes (idempotente, seguro em dados existentes)
-- Execute: mysql -u root -p modaluxo < schema_fixes.sql

USE modaluxo;

-- ─────────────────────────────────────────────────────────
-- 1. FKs com ON DELETE SET NULL (histórico preservado)
-- ─────────────────────────────────────────────────────────

-- order_items.product_id → products (SET NULL)
ALTER TABLE order_items
  ADD CONSTRAINT fk_oi_product
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE SET NULL;

-- conversations.product_id → products (SET NULL)
ALTER TABLE conversations
  ADD CONSTRAINT fk_conv_product
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE SET NULL;

-- ─────────────────────────────────────────────────────────
-- 2. CHECK constraints
-- ─────────────────────────────────────────────────────────

ALTER TABLE reviews
  ADD CONSTRAINT chk_rating CHECK (rating BETWEEN 1 AND 5);

ALTER TABLE products
  ADD CONSTRAINT chk_price CHECK (price > 0);

ALTER TABLE orders
  ADD CONSTRAINT chk_total CHECK (total > 0);
