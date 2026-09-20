package com.school.management.dto.request;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class UpdateClassRequest {
    @NotBlank(message = "Grade is required")
    @Size(max = 30, message = "Grade must not exceed 30 characters")
    private String grade;

    @NotBlank(message = "Section is required")
    @Size(max = 10, message = "Section must not exceed 10 characters")
    private String section;

    @Size(max = 500, message = "Description must not exceed 500 characters")
    private String description;

    @Min(value = 0, message = "Capacity cannot be negative")
    private Integer capacity;

    @Size(max = 120, message = "Class teacher name must not exceed 120 characters")
    private String classTeacherName;

    @NotNull(message = "Status is required")
    private Boolean active;
}
