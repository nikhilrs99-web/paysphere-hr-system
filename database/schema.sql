-- PaySphere Database Schema for Supabase (PostgreSQL)

-- 1. Employees Table
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

-- 2. Employee Roles (ElementCollection)
CREATE TABLE IF NOT EXISTS employee_roles (
    employee_id BIGINT REFERENCES employees(id) ON DELETE CASCADE,
    role VARCHAR(50),
    PRIMARY KEY (employee_id, role)
);

-- 3. Attendance Records
CREATE TABLE IF NOT EXISTS attendance_records (
    id BIGSERIAL PRIMARY KEY,
    employee_id BIGINT REFERENCES employees(id) ON DELETE CASCADE,
    clock_in TIMESTAMP WITH TIME ZONE,
    clock_out TIMESTAMP WITH TIME ZONE,
    total_hours DECIMAL(10, 2),
    overtime_hours DECIMAL(10, 2),
    status VARCHAR(50), -- ON_TIME, LATE, OVERTIME
    location VARCHAR(100), -- Remote, Office
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 4. Payroll Records
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

-- 5. Job Postings
CREATE TABLE IF NOT EXISTS job_postings (
    id BIGSERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    department VARCHAR(255),
    location VARCHAR(255),
    status VARCHAR(50) DEFAULT 'ACTIVE', -- ACTIVE, CLOSED
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 6. Candidates
CREATE TABLE IF NOT EXISTS candidates (
    id BIGSERIAL PRIMARY KEY,
    first_name VARCHAR(255) NOT NULL,
    last_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone_number VARCHAR(50),
    resume_url TEXT,
    status VARCHAR(50) DEFAULT 'NEW', -- NEW, SHORTLISTED, SCREENING, INTERVIEW, OFFER, HIRED, REJECTED
    job_posting_id BIGINT REFERENCES job_postings(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 7. Scorecards
CREATE TABLE IF NOT EXISTS scorecards (
    id BIGSERIAL PRIMARY KEY,
    technical_rating INTEGER CHECK (technical_rating BETWEEN 1 AND 5),
    cultural_rating INTEGER CHECK (cultural_rating BETWEEN 1 AND 5),
    communication_rating INTEGER CHECK (communication_rating BETWEEN 1 AND 5),
    technical_notes TEXT,
    cultural_notes TEXT,
    overall_score DECIMAL(5, 2),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 8. Interviews
CREATE TABLE IF NOT EXISTS interviews (
    id BIGSERIAL PRIMARY KEY,
    candidate_id BIGINT NOT NULL REFERENCES candidates(id) ON DELETE CASCADE,
    date_time TIMESTAMP WITH TIME ZONE,
    interviewer VARCHAR(255),
    description TEXT,
    notes TEXT,
    feedback TEXT,
    rating INTEGER CHECK (rating BETWEEN 1 AND 5),
    scorecard_id BIGINT REFERENCES scorecards(id) ON DELETE SET NULL,
    status VARCHAR(50) DEFAULT 'SCHEDULED', -- SCHEDULED, COMPLETED, CANCELLED
    invitation_sent BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 9. Benefit Packages
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

-- 10. Employee Benefits (Enrollments)
CREATE TABLE IF NOT EXISTS employee_benefits (
    id BIGSERIAL PRIMARY KEY,
    employee_id BIGINT REFERENCES employees(id) ON DELETE CASCADE,
    benefit_package_id BIGINT REFERENCES benefit_packages(id) ON DELETE CASCADE,
    enrollment_date DATE,
    status VARCHAR(50), -- ACTIVE, WAITING_PERIOD, CANCELLED
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 11. Goals
CREATE TABLE IF NOT EXISTS goals (
    id BIGSERIAL PRIMARY KEY,
    employee_id BIGINT NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    target_date DATE,
    status VARCHAR(50) DEFAULT 'IN_PROGRESS', -- NOT_STARTED, IN_PROGRESS, COMPLETED, OVERDUE
    completion_percentage INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 12. Onboarding Workflows
CREATE TABLE IF NOT EXISTS onboarding_workflows (
    id BIGSERIAL PRIMARY KEY,
    employee_id BIGINT UNIQUE NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
    country VARCHAR(100),
    status VARCHAR(50) DEFAULT 'IN_PROGRESS', -- IN_PROGRESS, COMPLETED, CANCELLED
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 13. Onboarding Steps
CREATE TABLE IF NOT EXISTS onboarding_steps (
    id BIGSERIAL PRIMARY KEY,
    workflow_id BIGINT NOT NULL REFERENCES onboarding_workflows(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    type VARCHAR(50), -- CONTRACT, DOCUMENT, COMPLIANCE, TRAINING
    status VARCHAR(50) DEFAULT 'PENDING', -- PENDING, COMPLETED, SKIPPED
    due_date DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 14. Performance Reviews
CREATE TABLE IF NOT EXISTS performance_reviews (
    id BIGSERIAL PRIMARY KEY,
    employee_id BIGINT NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
    reviewer_id BIGINT NOT NULL REFERENCES employees(id) ON DELETE SET NULL,
    period VARCHAR(100),
    rating INTEGER CHECK (rating BETWEEN 1 AND 5),
    feedback TEXT,
    review_date DATE,
    status VARCHAR(50) DEFAULT 'SUBMITTED', -- DRAFT, SUBMITTED, FINALIZED
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 15. Documents
CREATE TABLE IF NOT EXISTS documents (
    id BIGSERIAL PRIMARY KEY,
    employee_id BIGINT REFERENCES employees(id) ON DELETE CASCADE,
    file_name VARCHAR(255) NOT NULL,
    file_type VARCHAR(100),
    data BYTEA, -- Store actual file data for now
    upload_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 16. Feedback 360
CREATE TABLE IF NOT EXISTS feedback_360 (
    id BIGSERIAL PRIMARY KEY,
    subject_id BIGINT NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
    provider_id BIGINT NOT NULL REFERENCES employees(id) ON DELETE SET NULL,
    relationship VARCHAR(100), -- Peer, Manager, Direct Report, Self
    rating INTEGER CHECK (rating BETWEEN 1 AND 5),
    comments TEXT,
    date_provided DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 17. Talent Programs
CREATE TABLE IF NOT EXISTS talent_programs (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    target_region VARCHAR(100),
    target_role VARCHAR(100),
    duration_weeks INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 18. Program Objectives (ElementCollection)
CREATE TABLE IF NOT EXISTS talent_program_objectives (
    program_id BIGINT REFERENCES talent_programs(id) ON DELETE CASCADE,
    objective TEXT,
    PRIMARY KEY (program_id, objective)
);

-- 19. Program Enrollees (ManyToMany)
CREATE TABLE IF NOT EXISTS program_enrollees (
    program_id BIGINT REFERENCES talent_programs(id) ON DELETE CASCADE,
    employee_id BIGINT REFERENCES employees(id) ON DELETE CASCADE,
    PRIMARY KEY (program_id, employee_id)
);

-- 20. Succession Plans
CREATE TABLE IF NOT EXISTS succession_plans (
    id BIGSERIAL PRIMARY KEY,
    employee_id BIGINT UNIQUE NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
    potential VARCHAR(50) DEFAULT 'MEDIUM', -- HIGH, MEDIUM, LOW
    readiness VARCHAR(50) DEFAULT 'IN_2_YEARS', -- READY_NOW, IN_1_YEAR, IN_2_YEARS, EMERGENCY_ONLY
    target_role VARCHAR(255),
    development_needs TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 21. Tax Configs
CREATE TABLE IF NOT EXISTS tax_configs (
    id BIGSERIAL PRIMARY KEY,
    country_code VARCHAR(10) UNIQUE NOT NULL,
    income_tax_rate DECIMAL(5, 2),
    social_security_rate DECIMAL(5, 2),
    health_insurance_rate DECIMAL(5, 2),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 22. Compensation Structures
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

-- 23. Bonus Records
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

-- Indices for performance
CREATE INDEX IF NOT EXISTS idx_employees_email ON employees(email);
CREATE INDEX IF NOT EXISTS idx_attendance_employee ON attendance_records(employee_id);
CREATE INDEX IF NOT EXISTS idx_payroll_employee ON payroll_records(employee_id);
CREATE INDEX IF NOT EXISTS idx_candidates_posting ON candidates(job_posting_id);
CREATE INDEX IF NOT EXISTS idx_interviews_candidate ON interviews(candidate_id);
