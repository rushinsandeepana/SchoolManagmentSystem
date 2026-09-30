CREATE TABLE media_files (
    id BIGSERIAL PRIMARY KEY,
    period_content_id BIGINT NOT NULL,
    uploaded_by BIGINT NOT NULL,
    original_file_name VARCHAR(255) NOT NULL,
    stored_file_name VARCHAR(255) NOT NULL,
    content_type VARCHAR(100) NOT NULL,
    file_size BIGINT NOT NULL,
    file_category VARCHAR(20) NOT NULL,
    uploaded_at TIMESTAMP WITH TIME ZONE NOT NULL,

    CONSTRAINT fk_media_file_period_content
        FOREIGN KEY (period_content_id)
        REFERENCES period_contents(id)
        ON DELETE CASCADE,

    CONSTRAINT fk_media_file_uploaded_by
        FOREIGN KEY (uploaded_by)
        REFERENCES users(id)
);