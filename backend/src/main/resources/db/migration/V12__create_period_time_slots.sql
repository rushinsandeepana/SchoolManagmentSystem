CREATE TABLE period_time_slots (
    period_number INTEGER PRIMARY KEY,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    CONSTRAINT chk_period_time_slots_number CHECK (period_number BETWEEN 1 AND 8),
    CONSTRAINT chk_period_time_slots_time_range CHECK (start_time < end_time)
);

INSERT INTO period_time_slots (period_number, start_time, end_time) VALUES
    (1, '07:30', '08:30'),
    (2, '08:30', '09:10'),
    (3, '09:10', '09:50'),
    (4, '09:50', '10:30'),
    (5, '10:50', '11:30'),
    (6, '11:30', '12:10'),
    (7, '12:10', '12:50'),
    (8, '12:50', '13:30');
