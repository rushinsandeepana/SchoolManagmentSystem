package com.school.management.dto.response;

import com.school.management.model.enums.DayOfWeek;
import com.school.management.model.enums.PeriodType;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class PeriodSlotResponse {
    private Long id;
    private Long teacherId;
    private String teacherName;
    private DayOfWeek dayOfWeek;
    private Integer periodNumber;
    private PeriodType periodType;
    private String subject;
    private String className;
    private String title;
}
