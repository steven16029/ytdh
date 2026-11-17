CREATE TABLE IF NOT EXISTS regional_metrics (
    id SERIAL PRIMARY KEY,
    region_code VARCHAR(10) UNIQUE NOT NULL,
    region_name VARCHAR(100) NOT NULL,
    currency VARCHAR(10) NOT NULL,
    revenue NUMERIC(18, 2) NOT NULL,
    orders_count INTEGER NOT NULL,
    tax_label VARCHAR(50) NOT NULL,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO regional_metrics (region_code, region_name, currency, revenue, orders_count, tax_label)
VALUES
    ('LATAM', 'Latinoamérica (Bogotá)', 'COP', 5850000000.00, 412, '19% IVA'),
    ('NA', 'Norteamérica (New York)', 'USD', 1450000.00, 342, '8.875% Sales Tax'),
    ('EU', 'Europa (Frankfurt)', 'EUR', 1320000.00, 289, '19% MwSt')
ON CONFLICT (region_code) DO UPDATE SET
    revenue = EXCLUDED.revenue,
    orders_count = EXCLUDED.orders_count,
    updated_at = CURRENT_TIMESTAMP;
