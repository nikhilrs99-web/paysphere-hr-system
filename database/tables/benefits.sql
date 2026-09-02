-- Benefits Management Tables
CREATE TABLE IF NOT EXISTS benefit_packages (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    type VARCHAR(50), -- HEALTHCARE, RETIREMENT, ALLOWANCE, etc.
    description TEXT,
    provider VARCHAR(255),
    monthly_cost DECIMAL(15, 2),
    employer_contribution DECIMAL(15, 2),
    region VARCHAR(100),
    contract_type VARCHAR(50), -- FULL_TIME, PART_TIME, CONTRACTOR
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS employee_benefits (
    id BIGSERIAL PRIMARY KEY,
    employee_id BIGINT REFERENCES employees(id) ON DELETE CASCADE,
    benefit_package_id BIGINT REFERENCES benefit_packages(id) ON DELETE CASCADE,
    enrollment_date DATE,
    status VARCHAR(50), -- ACTIVE, WAITING_PERIOD, CANCELLED
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
