-- PaySphere Employee Management Module Migration
-- Module: Employees
-- Description: Adds essential fields for full employee lifecycle management

-- 1. Add new columns to employees table
ALTER TABLE employees 
ADD COLUMN IF NOT EXISTS phone VARCHAR(20),
ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'ACTIVE',
ADD COLUMN IF NOT EXISTS joining_date DATE DEFAULT CURRENT_DATE;

-- 2. Update existing records (if any) to have a default status
UPDATE employees SET status = 'ACTIVE' WHERE status IS NULL;

-- 3. Add index for performance on frequently filtered columns
CREATE INDEX IF NOT EXISTS idx_employees_status ON employees(status);
CREATE INDEX IF NOT EXISTS idx_employees_department ON employees(department);
CREATE INDEX IF NOT EXISTS idx_employees_joining_date ON employees(joining_date);

-- 4. Create employee_roles table (required for @ElementCollection)
CREATE TABLE IF NOT EXISTS employee_roles (
    employee_id BIGINT REFERENCES employees(id) ON DELETE CASCADE,
    role VARCHAR(50),
    PRIMARY KEY (employee_id, role)
);

-- 5. Seed an initial "Admin" profile so the directory is not empty
INSERT INTO employees (first_name, last_name, email, job_title, department, status, joining_date, country)
SELECT 'System', 'Admin', 'admin@paysphere.com', 'HR Administrator', 'HR', 'ACTIVE', CURRENT_DATE, 'Global'
WHERE NOT EXISTS (SELECT 1 FROM employees WHERE email = 'admin@paysphere.com');

-- 6. Assign role to the seeded employee
INSERT INTO employee_roles (employee_id, role)
SELECT id, 'ADMIN' FROM employees WHERE email = 'admin@paysphere.com'
ON CONFLICT DO NOTHING;
