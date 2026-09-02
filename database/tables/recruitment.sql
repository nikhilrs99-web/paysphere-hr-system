-- Recruitment Module Tables
CREATE TABLE IF NOT EXISTS job_postings (
    id BIGSERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    department VARCHAR(255),
    location VARCHAR(255),
    status VARCHAR(50) DEFAULT 'ACTIVE', -- ACTIVE, CLOSED
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

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

CREATE INDEX IF NOT EXISTS idx_candidates_posting ON candidates(job_posting_id);
CREATE INDEX IF NOT EXISTS idx_interviews_candidate ON interviews(candidate_id);
