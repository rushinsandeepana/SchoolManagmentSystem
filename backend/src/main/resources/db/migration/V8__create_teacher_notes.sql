CREATE TABLE teacher_notes (
    id BIGSERIAL PRIMARY KEY,
    teacher_id BIGINT NOT NULL,
    created_by BIGINT NOT NULL,
    title VARCHAR(200) NOT NULL,
    content TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL,

    CONSTRAINT fk_teacher_note_teacher
        FOREIGN KEY (teacher_id)
        REFERENCES users(id),

    CONSTRAINT fk_teacher_note_created_by
        FOREIGN KEY (created_by)
        REFERENCES users(id)
);