-- Talent & Succession Management Tables
CREATE TABLE IF NOT EXISTS talent_programs (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    target_region VARCHAR(100),
    target_role VARCHAR(100),
    duration_weeks INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS talent_program_objectives (
    program_id BIGINT REFERENCES talent_programs(id) ON DELETE CASCADE,
    objective TEXT,
    PRIMARY KEY (program_id, objective)
);

CREATE TABLE IF NOT EXISTS program_enrollees (
    program_id BIGINT REFERENCES talent_programs(id) ON DELETE CASCADE,
    employee_id BIGINT REFERENCES employees(id) ON DELETE CASCADE,
    PRIMARY KEY (program_id, employee_id)
);

CREATE TABLE IF NOT EXISTS succession_plans (
    id BIGSERIAL PRIMARY KEY,
    employee_id BIGINT UNIQUE NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
    potential VARCHAR(50) DEFAULT 'MEDIUM', -- HIGH, MEDIUM, LOW
    readiness VARCHAR(50) DEFAULT 'IN_2_YEARS', -- READY_NOW, IN_1_YEAR, IN_2_YEARS, EMERGENCY_ONLY
    target_role VARCHAR(255),
    development_needs TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
