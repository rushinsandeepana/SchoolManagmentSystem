CREATE TABLE school_classes (
    id BIGSERIAL PRIMARY KEY,
    grade VARCHAR(30) NOT NULL,
    section VARCHAR(10) NOT NULL,
    description VARCHAR(500),
    capacity INTEGER,
    class_teacher_id BIGINT,
    active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL,

    CONSTRAINT uk_school_classes_grade_section
        UNIQUE (grade, section),

    CONSTRAINT fk_school_class_teacher
        FOREIGN KEY (class_teacher_id)
        REFERENCES users(id)
);