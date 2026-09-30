package com.school.management.dto.request;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

@Getter 
@Setter 
public class TimetableRequest {
    @NotNull(message = "Teacher is required")
    private Long teacherId;

    @NotNull (message = "Subject is required")
    private Long subjectId;

    @NotNull(message = "Class is required")
    private Long classId;

    @NotBlank (message = "Day is required")
    private String day;

    @NotNull(message = "Period is required")
    @Min(value = 1, message = "Period must be between 1 and 8")
    @Max(value = 8, message = "Period must be between 1 and 8")
    private Integer period;
}
