package com.school.management.dto.response;

import com.school.management.model.enums.AttendanceStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TeacherAttendanceResponse {
    private Long id;
    private Long teacherId;
    private String teacherName;
    private String teacherUsername;
    private String teacherEmail;
    private LocalDate attendanceDate;
    private AttendanceStatus status;
    private String remark;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
