package com.school.management.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class TeacherNoteRequest {
    @NotNull
    private Long teacherId;

    @NotBlank
    private String title;

    @NotBlank
    private String content;
}
