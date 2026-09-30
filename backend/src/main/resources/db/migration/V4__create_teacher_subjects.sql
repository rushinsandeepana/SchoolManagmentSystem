CREATE TABLE teacher_subjects (
    id BIGSERIAL PRIMARY KEY,
    teacher_id BIGINT NOT NULL,
    subject_id BIGINT NOT NULL,

    CONSTRAINT uk_teacher_subject
        UNIQUE (teacher_id, subject_id),

    CONSTRAINT fk_teacher_subject_teacher
        FOREIGN KEY (teacher_id)
        REFERENCES users(id)
        ON DELETE CASCADE,

    CONSTRAINT fk_teacher_subject_subject
        FOREIGN KEY (subject_id)
        REFERENCES subjects(id)
        ON DELETE CASCADE
);

CREATE INDEX idx_teacher_subjects_teacher_id
    ON teacher_subjects (teacher_id);

CREATE INDEX idx_teacher_subjects_subject_id
    ON teacher_subjects (subject_id);