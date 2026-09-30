CREATE TABLE timetables (
    id BIGSERIAL PRIMARY KEY,
    teacher_id BIGINT NOT NULL,
    subject_id BIGINT NOT NULL,
    class_id BIGINT NOT NULL,
    day VARCHAR(20) NOT NULL,
    period INTEGER NOT NULL,
    created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL,
    updated_at TIMESTAMP WITHOUT TIME ZONE NOT NULL,

    CONSTRAINT uk_timetable_teacher_day_period
        UNIQUE (teacher_id, day, period),

    CONSTRAINT uk_timetable_class_day_period
        UNIQUE (class_id, day, period),

    CONSTRAINT fk_timetable_teacher
        FOREIGN KEY (teacher_id)
        REFERENCES users(id)
        ON DELETE CASCADE,

    CONSTRAINT fk_timetable_subject
        FOREIGN KEY (subject_id)
        REFERENCES subjects(id),

    CONSTRAINT fk_timetable_class
        FOREIGN KEY (class_id)
        REFERENCES school_classes(id)
);

CREATE INDEX idx_timetable_teacher
    ON timetables (teacher_id);

CREATE INDEX idx_timetable_subject
    ON timetables (subject_id);

CREATE INDEX idx_timetable_class
    ON timetables (class_id);