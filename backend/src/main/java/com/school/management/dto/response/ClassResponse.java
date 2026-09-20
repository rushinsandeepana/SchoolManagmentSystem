package com.school.management.dto.response;

import lombok.Builder;
import lombok.Data;

import java.time.Instant;

@Data
@Builder
public class ClassResponse {
    private Long id;
    private String grade;
    private String section;
    private String description;
    private Integer capacity;
    private String classTeacherName;
    private boolean active;
    private Instant createdAt;
    private Instant updatedAt;
}
