-- Suppliers core schema to support SupplierManagement and PO routing

CREATE TABLE IF NOT EXISTS suppliers (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(50),
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active','suspended','inactive')),
    requires_confirmation BOOLEAN DEFAULT true,
    pack_unit VARCHAR(50),
    moq INTEGER,
    lead_time_days INTEGER,
    notes TEXT,
    special_offers TEXT,
    priority_flag BOOLEAN DEFAULT false,
    bank_details TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL
);

-- Mapping suppliers to subcategories (many-to-many)
CREATE TABLE IF NOT EXISTS supplier_subcategories (
    id SERIAL PRIMARY KEY,
    supplier_id INTEGER NOT NULL REFERENCES suppliers(id) ON DELETE CASCADE,
    subcategory_id INTEGER NOT NULL REFERENCES subcategories(id) ON DELETE CASCADE,
    UNIQUE (supplier_id, subcategory_id)
);

CREATE INDEX IF NOT EXISTS idx_suppliers_status ON suppliers(status);
CREATE INDEX IF NOT EXISTS idx_supplier_subcategories_supplier ON supplier_subcategories(supplier_id);
CREATE INDEX IF NOT EXISTS idx_supplier_subcategories_subcategory ON supplier_subcategories(subcategory_id);

-- Optional: extend users to store agent id scan
ALTER TABLE users ADD COLUMN IF NOT EXISTS id_scan_url VARCHAR(500);
