package com.school.management.dto.request;

import jakarta.validation.constraints.NotNull;
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
public class TeacherAttendanceSaveRequest {

    @NotNull(message = "Attendance date is required")
    private LocalDate date;

    /**
     * If provided, specific list of attendance records to save/update.
     */
    private List<TeacherAttendanceItemRequest> records;

    /**
     * If provided (exception-based marking), any active teacher NOT in this list
     * will automatically be marked PRESENT. Teachers in this list are saved with their given status/remark.
     */
    private List<TeacherAttendanceItemRequest> exceptions;
}
