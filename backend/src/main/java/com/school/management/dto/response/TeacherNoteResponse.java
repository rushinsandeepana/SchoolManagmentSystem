package com.school.management.dto.response;

import lombok.Builder;
import lombok.Data;

import java.time.Instant;

@Data
@Builder
public class TeacherNoteResponse {
    private Long id;
    private Long teacherId;
    private String teacherName;
    private String title;
    private String content;
    private String createdByName;
    private Instant createdAt;
}
