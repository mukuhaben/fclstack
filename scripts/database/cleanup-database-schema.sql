-- Comprehensive Database Cleanup Script
-- Remove irrelevant fields and optimize the database schema

-- ==============================================
-- PRODUCTS TABLE CLEANUP
-- ==============================================

-- Remove reorder-related fields from products table
ALTER TABLE products DROP COLUMN IF EXISTS reorder_level;
ALTER TABLE products DROP COLUMN IF EXISTS order_level;
ALTER TABLE products DROP COLUMN IF EXISTS alert_quantity;
ALTER TABLE products DROP COLUMN IF EXISTS reorder_active;

-- Remove stock-related fields (stock is managed separately)
ALTER TABLE products DROP COLUMN IF EXISTS stock_quantity;

-- Remove UOM and pack size fields (not currently used)
ALTER TABLE products DROP COLUMN IF EXISTS uom;
ALTER TABLE products DROP COLUMN IF EXISTS pack_size;

-- Remove barcode and ETIMS fields (not currently used)
ALTER TABLE products DROP COLUMN IF EXISTS product_barcode;
ALTER TABLE products DROP COLUMN IF EXISTS etims_ref_code;

-- Remove expiry date field (not currently used)
ALTER TABLE products DROP COLUMN IF EXISTS expiry_date;

-- Remove SKU field (we're using product_code instead)
ALTER TABLE products DROP COLUMN IF EXISTS sku;

-- Ensure required fields exist
ALTER TABLE products ADD COLUMN IF NOT EXISTS image_url VARCHAR(500);
ALTER TABLE products ADD COLUMN IF NOT EXISTS class VARCHAR(50) DEFAULT 'Standard';

-- ==============================================
-- CATEGORIES TABLE CLEANUP
-- ==============================================

-- Remove parent_id field if not being used (we have separate subcategories table)
-- ALTER TABLE categories DROP COLUMN IF EXISTS parent_id;

-- Ensure required fields exist
ALTER TABLE categories ADD COLUMN IF NOT EXISTS slug VARCHAR(255);
ALTER TABLE categories ADD COLUMN IF NOT EXISTS image VARCHAR(500);

-- ==============================================
-- SUBCATEGORIES TABLE CLEANUP
-- ==============================================

-- Ensure required fields exist
ALTER TABLE subcategories ADD COLUMN IF NOT EXISTS slug VARCHAR(255);
ALTER TABLE subcategories ADD COLUMN IF NOT EXISTS image VARCHAR(500);

-- ==============================================
-- PRODUCT VARIANTS TABLE CLEANUP
-- ==============================================

-- Remove stock_quantity from variants if not being used
-- ALTER TABLE product_variants DROP COLUMN IF EXISTS stock_quantity;

-- ==============================================
-- CREATE OPTIMIZED INDEXES
-- ==============================================

-- Products table indexes
CREATE INDEX IF NOT EXISTS idx_products_image_url ON products(image_url);
CREATE INDEX IF NOT EXISTS idx_products_class ON products(class);
CREATE INDEX IF NOT EXISTS idx_products_active ON products(is_active);
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_subcategory ON products(subcategory_id);
CREATE INDEX IF NOT EXISTS idx_products_code ON products(product_code);

-- Categories table indexes
CREATE INDEX IF NOT EXISTS idx_categories_slug ON categories(slug);
CREATE INDEX IF NOT EXISTS idx_categories_active ON categories(is_active);

-- Subcategories table indexes
CREATE INDEX IF NOT EXISTS idx_subcategories_slug ON subcategories(slug);
CREATE INDEX IF NOT EXISTS idx_subcategories_category ON subcategories(category_id);
CREATE INDEX IF NOT EXISTS idx_subcategories_active ON subcategories(is_active);

-- Product images table indexes
CREATE INDEX IF NOT EXISTS idx_product_images_product ON product_images(product_id);
CREATE INDEX IF NOT EXISTS idx_product_images_primary ON product_images(is_primary);

-- Product pricing tiers indexes
CREATE INDEX IF NOT EXISTS idx_pricing_tiers_product ON product_pricing_tiers(product_id);

-- ==============================================
-- UPDATE NULL VALUES
-- ==============================================

-- Update NULL values to appropriate defaults
UPDATE products SET image_url = '' WHERE image_url IS NULL;
UPDATE products SET class = 'Standard' WHERE class IS NULL;
UPDATE products SET is_active = true WHERE is_active IS NULL;

UPDATE categories SET slug = LOWER(REPLACE(name, ' ', '-')) WHERE slug IS NULL OR slug = '';
UPDATE categories SET is_active = true WHERE is_active IS NULL;

UPDATE subcategories SET slug = LOWER(REPLACE(name, ' ', '-')) WHERE slug IS NULL OR slug = '';
UPDATE subcategories SET is_active = true WHERE is_active IS NULL;

-- ==============================================
-- VERIFY CLEANUP
-- ==============================================

-- Show final products table structure
SELECT 
    'PRODUCTS TABLE' as table_name,
    column_name, 
    data_type, 
    is_nullable, 
    column_default
FROM information_schema.columns 
WHERE table_name = 'products' 
ORDER BY ordinal_position;

-- Show final categories table structure
SELECT 
    'CATEGORIES TABLE' as table_name,
    column_name, 
    data_type, 
    is_nullable, 
    column_default
FROM information_schema.columns 
WHERE table_name = 'categories' 
ORDER BY ordinal_position;

-- Show final subcategories table structure
SELECT 
    'SUBCATEGORIES TABLE' as table_name,
    column_name, 
    data_type, 
    is_nullable, 
    column_default
FROM information_schema.columns 
WHERE table_name = 'subcategories' 
ORDER BY ordinal_position;

-- Show indexes
SELECT 
    schemaname,
    tablename,
    indexname,
    indexdef
FROM pg_indexes 
WHERE tablename IN ('products', 'categories', 'subcategories', 'product_images', 'product_pricing_tiers')
ORDER BY tablename, indexname;