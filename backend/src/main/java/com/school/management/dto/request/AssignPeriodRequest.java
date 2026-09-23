package com.school.management.dto.request;

import com.school.management.model.enums.DayOfWeek;
import com.school.management.model.enums.PeriodType;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class AssignPeriodRequest {
    @NotNull(message = "Teacher is required")
    private Long teacherId;

    @NotNull(message = "Day is required")
    private DayOfWeek dayOfWeek;
    private String date;

    @NotNull(message = "Period is required")
    @Min(value = 1, message = "Period must be between 1 and 8")
    @Max(value = 8, message = "Period must be between 1 and 8")
    private Integer periodNumber;

    @NotNull(message = "Period type is required")
    private PeriodType periodType;

    private String subject;
    private String className;
    private String title;
}
