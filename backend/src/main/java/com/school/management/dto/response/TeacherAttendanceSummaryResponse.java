package com.school.management.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TeacherAttendanceSummaryResponse {
    private Long teacherId;
    private String teacherName;
    private String teacherUsername;
    private int presentDays;
    private int absentDays;
    private int leaveDays;
    private int halfDays;
    private int totalDaysRecorded;
    private double attendancePercentage;
}
