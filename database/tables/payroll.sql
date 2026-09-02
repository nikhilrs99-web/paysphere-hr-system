-- Payroll & Bonus Records Table
CREATE TABLE IF NOT EXISTS payroll_records (
    id BIGSERIAL PRIMARY KEY,
    employee_id BIGINT REFERENCES employees(id) ON DELETE CASCADE,
    pay_period_start DATE,
    pay_period_end DATE,
    gross_salary DECIMAL(15, 2),
    tax_amount DECIMAL(15, 2),
    benefits_amount DECIMAL(15, 2),
    net_salary DECIMAL(15, 2),
    currency VARCHAR(10),
    status VARCHAR(50), -- PENDING, PAID, VOID
    payment_reference VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS bonus_records (
    id BIGSERIAL PRIMARY KEY,
    employee_id BIGINT REFERENCES employees(id) ON DELETE CASCADE,
    amount DECIMAL(15, 2),
    type VARCHAR(50), -- PERFORMANCE, REFERRAL, SIGN_ON, ANNUAL
    allocation_date DATE,
    status VARCHAR(50), -- PENDING, PROCESSED, CANCELLED
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_payroll_employee ON payroll_records(employee_id);
