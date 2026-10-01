CREATE TABLE teacher_attendance (
    id BIGSERIAL PRIMARY KEY,
    teacher_id BIGINT NOT NULL,
    attendance_date DATE NOT NULL,
    status VARCHAR(20) NOT NULL,
    remark VARCHAR(255),
    created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT uk_teacher_attendance_date
        UNIQUE (teacher_id, attendance_date),

    CONSTRAINT fk_teacher_attendance_teacher
        FOREIGN KEY (teacher_id)
        REFERENCES users(id)
        ON DELETE CASCADE
);

CREATE INDEX idx_teacher_attendance_date
    ON teacher_attendance (attendance_date);

CREATE INDEX idx_teacher_attendance_teacher
    ON teacher_attendance (teacher_id);

CREATE INDEX idx_teacher_attendance_status
    ON teacher_attendance (status);
