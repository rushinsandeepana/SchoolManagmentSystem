package com.school.management.dto.response;

import java.time.Instant;

import com.school.management.model.enums.SubjectType;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class SubjectResponse {
    private Long id;
    private String subjectName;
    private String subjectCode;
    private SubjectType subjectType;
    private boolean active;
    private Instant createdAt;
    private Instant updatedAt;
}
