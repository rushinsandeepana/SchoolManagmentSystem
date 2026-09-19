package com.school.management.dto.request;

import com.school.management.model.enums.DayOfWeek;
import com.school.management.model.enums.PeriodType;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class AssignPeriodRequest {
    @NotNull
    private Long teacherId;

    @NotNull
    private DayOfWeek dayOfWeek;

    @NotNull
    @Min(1)
    @Max(8)
    private Integer periodNumber;

    @NotNull
    private PeriodType periodType;

    private String subject;
    private String className;
    private String title;
}
