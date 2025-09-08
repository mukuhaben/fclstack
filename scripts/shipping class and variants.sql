-- Migration script to add Class field and Product Variants support
-- Run this after the main schema creation

-- Add class field to products table for shipping classification
ALTER TABLE products 
ADD COLUMN class VARCHAR(50) NOT NULL DEFAULT 'Standard' 
CHECK (class IN ('Small', 'Medium', 'Large', 'Heavy', 'Fragile', 'Standard'));

-- Create product variants table for color, size, and other variations
CREATE TABLE product_variants (
    id SERIAL PRIMARY KEY,
    product_id INTEGER REFERENCES products(id) ON DELETE CASCADE,
    variant_type VARCHAR(50) NOT NULL, -- e.g., 'color', 'size', 'material'
    variant_value VARCHAR(100) NOT NULL, -- e.g., 'Red', 'Large', 'Cotton'
    variant_code VARCHAR(50), -- Optional SKU suffix for this variant
    price_adjustment DECIMAL(10,2) DEFAULT 0.00, -- Price difference from base product
    stock_quantity INTEGER DEFAULT 0, -- Variant-specific stock
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(product_id, variant_type, variant_value)
);

-- Create shipping classes table for better management
CREATE TABLE shipping_classes (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) UNIQUE NOT NULL,
    description TEXT,
    base_fee DECIMAL(10,2) DEFAULT 0.00, -- Base shipping fee for this class
    weight_limit DECIMAL(8,2), -- Maximum weight in kg
    size_limit VARCHAR(100), -- Size restrictions
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert default shipping classes
INSERT INTO shipping_classes (name, description, base_fee, weight_limit, size_limit) VALUES
('Small', 'Small items under 1kg', 50.00, 1.00, '20x20x10 cm'),
('Medium', 'Medium items 1-5kg', 100.00, 5.00, '40x40x30 cm'),
('Large', 'Large items 5-15kg', 200.00, 15.00, '80x60x50 cm'),
('Heavy', 'Heavy items over 15kg', 500.00, 50.00, '100x80x60 cm'),
('Fragile', 'Fragile items requiring special handling', 500.00, 10.00, '60x40x40 cm'),
('Standard', 'Standard shipping for regular items', 75.00, 3.00, '30x30x20 cm');

-- Add indexes for performance
CREATE INDEX idx_products_class ON products(class);
CREATE INDEX idx_product_variants_product ON product_variants(product_id);
CREATE INDEX idx_product_variants_type ON product_variants(variant_type);
CREATE INDEX idx_product_variants_active ON product_variants(is_active);
CREATE INDEX idx_shipping_classes_active ON shipping_classes(is_active);

-- Update existing products to have a default class if needed
UPDATE products SET class = 'Standard' WHERE class IS NULL;

-- Add comment to document the class field usage
COMMENT ON COLUMN products.class IS 'Shipping class for delivery fee calculation: Small, Medium, Large, Heavy, Fragile, Standard';
COMMENT ON TABLE product_variants IS 'Product variations like colors, sizes, materials with individual pricing and stock';
COMMENT ON TABLE shipping_classes IS 'Shipping class definitions with fees and restrictions';
