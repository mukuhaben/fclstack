-- Database Cleanup Script for Products Table
-- Remove irrelevant fields that are not being used in the current implementation

-- First, let's check what fields currently exist in the products table
-- \d products

-- Remove irrelevant fields from products table
-- These fields are not being used in the current implementation and can be safely removed

-- Remove reorder-related fields
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

-- Add any missing fields that are actually being used
-- Ensure image_url field exists (it should already exist)
ALTER TABLE products ADD COLUMN IF NOT EXISTS image_url VARCHAR(500);

-- Ensure class field exists for shipping class
ALTER TABLE products ADD COLUMN IF NOT EXISTS class VARCHAR(50) DEFAULT 'Standard';

-- Create index on image_url for better performance
CREATE INDEX IF NOT EXISTS idx_products_image_url ON products(image_url);

-- Create index on class for shipping class filtering
CREATE INDEX IF NOT EXISTS idx_products_class ON products(class);

-- Update any products that might have NULL image_url to empty string
UPDATE products SET image_url = '' WHERE image_url IS NULL;

-- Update any products that might have NULL class to 'Standard'
UPDATE products SET class = 'Standard' WHERE class IS NULL;

-- Verify the final structure
-- \d products

-- Show the cleaned up products table structure
SELECT 
    column_name, 
    data_type, 
    is_nullable, 
    column_default
FROM information_schema.columns 
WHERE table_name = 'products' 
ORDER BY ordinal_position;