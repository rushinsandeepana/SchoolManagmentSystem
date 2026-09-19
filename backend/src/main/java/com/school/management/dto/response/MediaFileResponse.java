package com.school.management.dto.response;

import lombok.Builder;
import lombok.Data;

import java.time.Instant;

@Data
@Builder
public class MediaFileResponse {
    private Long id;
    private String originalFileName;
    private String contentType;
    private Long fileSize;
    private String fileCategory;
    private String uploadedByName;
    private Instant uploadedAt;
    private String downloadUrl;
}
