package com.school.management.dto.request;

import com.school.management.model.enums.AttendanceStatus;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TeacherAttendanceItemRequest {

    @NotNull(message = "Teacher ID is required")
    private Long teacherId;

    @NotNull(message = "Attendance status is required")
    private AttendanceStatus status;

    private String remark;

    private LocalTime startTime;

    private LocalTime endTime;
}
