CREATE TABLE period_slots (
    id BIGSERIAL PRIMARY KEY,
    teacher_id BIGINT NOT NULL,
    day_of_week VARCHAR(20) NOT NULL,
    date VARCHAR(10),
    period_number INTEGER NOT NULL,
    period_type VARCHAR(20) NOT NULL,
    subject VARCHAR(120),
    class_name VARCHAR(80),
    title VARCHAR(255),

    CONSTRAINT uk_period_slots_teacher_day_period
        UNIQUE (teacher_id, day_of_week, period_number),

    CONSTRAINT fk_period_slot_teacher
        FOREIGN KEY (teacher_id)
        REFERENCES users(id)
        ON DELETE CASCADE
);