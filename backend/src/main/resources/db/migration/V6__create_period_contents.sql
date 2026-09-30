CREATE TABLE period_contents (
    id BIGSERIAL PRIMARY KEY,
    period_slot_id BIGINT NOT NULL,
    activity_title VARCHAR(200),
    activity_description TEXT,
    notes TEXT,
    created_at TIMESTAMP WITHOUT TIME ZONE,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL,

    CONSTRAINT fk_period_content_period_slot
        FOREIGN KEY (period_slot_id)
        REFERENCES period_slots(id)
        ON DELETE CASCADE
);