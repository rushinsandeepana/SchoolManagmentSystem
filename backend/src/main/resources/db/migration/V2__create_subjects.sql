CREATE TABLE subjects (
    id BIGSERIAL PRIMARY KEY,
    subject_name VARCHAR(120) NOT NULL,
    subject_code VARCHAR(30) NOT NULL,
    subject_type VARCHAR(20) NOT NULL,
    active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL,

    CONSTRAINT uk_subjects_subject_code
        UNIQUE (subject_code)
);