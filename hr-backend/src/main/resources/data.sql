-- Seeding Employees
INSERT INTO employee (first_name, last_name, email, job_title, department, status, joining_date, country, base_salary)
VALUES ('Nikhil', 'Admin', 'admin@hrproject.com', 'System Administrator', 'IT', 'ACTIVE', '2025-01-01', 'India', 95000.00);

INSERT INTO employee (first_name, last_name, email, job_title, department, status, joining_date, country, base_salary)
VALUES ('Rahul', 'Sharma', 'rahul@hrproject.com', 'HR Manager', 'HR', 'ACTIVE', '2025-02-15', 'India', 75000.00);

INSERT INTO employee (first_name, last_name, email, job_title, department, status, joining_date, country, base_salary)
VALUES ('Priya', 'Patel', 'priya@hrproject.com', 'Senior Developer', 'Engineering', 'ACTIVE', '2025-03-01', 'India', 120000.00);

INSERT INTO employee (first_name, last_name, email, job_title, department, status, joining_date, country, base_salary)
VALUES ('John', 'Doe', 'john@hrproject.com', 'Finance Specialist', 'Finance', 'DEACTIVE', '2024-11-10', 'USA', 85000.00);

-- Seeding Employee Roles (Linked to IDs)
-- H2 IDs usually start at 1
INSERT INTO employee_roles (employee_id, role) VALUES (1, 'ADMIN');
INSERT INTO employee_roles (employee_id, role) VALUES (2, 'HR');
INSERT INTO employee_roles (employee_id, role) VALUES (3, 'EMPLOYEE');
INSERT INTO employee_roles (employee_id, role) VALUES (4, 'EMPLOYEE');
