-- Employees & Roles Table
CREATE TABLE IF NOT EXISTS employees (
    id BIGSERIAL PRIMARY KEY,
    first_name VARCHAR(255) NOT NULL,
    last_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    job_title VARCHAR(255),
    department VARCHAR(255),
    location VARCHAR(255),
    base_salary DECIMAL(15, 2),
    currency VARCHAR(10),
    country VARCHAR(100),
    tax_id VARCHAR(100),
    bank_details TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS employee_roles (
    employee_id BIGINT REFERENCES employees(id) ON DELETE CASCADE,
    role VARCHAR(50),
    PRIMARY KEY (employee_id, role)
);

CREATE INDEX IF NOT EXISTS idx_employees_email ON employees(email);
