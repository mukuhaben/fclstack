-- Add slug columns to categories and subcategories tables
-- This script adds the missing slug columns needed for URL-based filtering

-- Add slug column to categories table
ALTER TABLE categories ADD COLUMN IF NOT EXISTS slug VARCHAR(255);

-- Add slug column to subcategories table  
ALTER TABLE subcategories ADD COLUMN IF NOT EXISTS slug VARCHAR(255);

-- Create function to generate slugs from names
CREATE OR REPLACE FUNCTION generate_slug(input_text TEXT) 
RETURNS TEXT AS $$
BEGIN
    RETURN LOWER(TRIM(REGEXP_REPLACE(
        REGEXP_REPLACE(input_text, '[^a-zA-Z0-9\s-]', '', 'g'),
        '\s+', '-', 'g'
    )));
END;
$$ LANGUAGE plpgsql;

-- Update existing categories with slugs
UPDATE categories 
SET slug = generate_slug(name) 
WHERE slug IS NULL OR slug = '';

-- Update existing subcategories with slugs
UPDATE subcategories 
SET slug = generate_slug(name) 
WHERE slug IS NULL OR slug = '';

-- Add unique constraints for slugs
ALTER TABLE categories ADD CONSTRAINT categories_slug_unique UNIQUE (slug);
ALTER TABLE subcategories ADD CONSTRAINT subcategories_slug_unique UNIQUE (slug);

-- Create indexes for slug-based lookups
CREATE INDEX IF NOT EXISTS idx_categories_slug ON categories(slug);
CREATE INDEX IF NOT EXISTS idx_subcategories_slug ON subcategories(slug);

-- Create trigger to auto-generate slugs for new categories
CREATE OR REPLACE FUNCTION auto_generate_category_slug()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.slug IS NULL OR NEW.slug = '' THEN
        NEW.slug = generate_slug(NEW.name);
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_auto_generate_category_slug
    BEFORE INSERT OR UPDATE ON categories
    FOR EACH ROW
    EXECUTE FUNCTION auto_generate_category_slug();

-- Create trigger to auto-generate slugs for new subcategories
CREATE OR REPLACE FUNCTION auto_generate_subcategory_slug()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.slug IS NULL OR NEW.slug = '' THEN
        NEW.slug = generate_slug(NEW.name);
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_auto_generate_subcategory_slug
    BEFORE INSERT OR UPDATE ON subcategories
    FOR EACH ROW
    EXECUTE FUNCTION auto_generate_subcategory_slug();
