-- System Configuration & Documents Tables
CREATE TABLE IF NOT EXISTS tax_configs (
    id BIGSERIAL PRIMARY KEY,
    country_code VARCHAR(10) UNIQUE NOT NULL,
    income_tax_rate DECIMAL(5, 2),
    social_security_rate DECIMAL(5, 2),
    health_insurance_rate DECIMAL(5, 2),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS compensation_structures (
    id BIGSERIAL PRIMARY KEY,
    role VARCHAR(255),
    region VARCHAR(100),
    min_salary DECIMAL(15, 2),
    max_salary DECIMAL(15, 2),
    currency VARCHAR(10),
    pay_frequency VARCHAR(50), -- HOURLY, SALARIED
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS documents (
    id BIGSERIAL PRIMARY KEY,
    employee_id BIGINT REFERENCES employees(id) ON DELETE CASCADE,
    file_name VARCHAR(255) NOT NULL,
    file_type VARCHAR(100),
    data BYTEA,
    upload_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
