package com.school.management.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class TeacherNoteRequest {
    @NotNull(message = "Teacher is required")
    private Long teacherId;

    @NotBlank(message = "Note title is required")
    private String title;

    @NotBlank(message = "Note content is required")
    private String content;
}
