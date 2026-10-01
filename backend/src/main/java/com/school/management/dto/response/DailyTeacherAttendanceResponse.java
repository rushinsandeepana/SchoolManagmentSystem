package com.school.management.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DailyTeacherAttendanceResponse {
    private LocalDate date;
    private int totalTeachers;
    private int presentCount;
    private int absentCount;
    private int leaveCount;
    private int halfDayCount;
    private boolean saved;
    private List<TeacherAttendanceResponse> records;
}
