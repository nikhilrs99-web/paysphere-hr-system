-- Performance & Goals Tables
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
