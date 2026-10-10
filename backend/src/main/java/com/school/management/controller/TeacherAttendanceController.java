package com.school.management.controller;

import com.school.management.dto.request.TeacherAttendanceSaveRequest;
import com.school.management.dto.response.DailyTeacherAttendanceResponse;
import com.school.management.dto.response.TeacherAttendanceResponse;
import com.school.management.dto.response.TeacherAttendanceSummaryResponse;
import com.school.management.security.UserPrincipal;
import com.school.management.service.TeacherAttendanceExcelService;
import com.school.management.service.TeacherAttendanceService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;
import java.time.LocalDate;
import java.util.List;

@Slf4j
@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class TeacherAttendanceController {

    private final TeacherAttendanceService attendanceService;
    private final TeacherAttendanceExcelService excelService;

    /**
     * Get daily attendance for a specific date (defaults to today).
     */
    @GetMapping("/admin/attendance/daily")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<DailyTeacherAttendanceResponse> getDailyAttendance(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        LocalDate targetDate = (date != null) ? date : LocalDate.now();
        return ResponseEntity.ok(attendanceService.getDailyAttendance(targetDate));
    }

    /**
     * Save/upsert teacher attendance for a specific date.
     */
    @PostMapping("/admin/attendance/save")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<DailyTeacherAttendanceResponse> saveDailyAttendance(
            @Valid @RequestBody TeacherAttendanceSaveRequest request) {
        return ResponseEntity.ok(attendanceService.saveDailyAttendance(request));
    }

    /**
     * Get teacher attendance records within a date range.
     */
    @GetMapping("/admin/attendance/range")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<TeacherAttendanceResponse>> getAttendanceRange(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate,
            @RequestParam(required = false) Long teacherId) {
        return ResponseEntity.ok(attendanceService.getAttendanceRange(startDate, endDate, teacherId));
    }

    /**
     * Get teacher attendance aggregated summary statistics within a date range.
     */
    @GetMapping("/admin/attendance/summary")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<TeacherAttendanceSummaryResponse>> getAttendanceSummaryRange(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        return ResponseEntity.ok(attendanceService.getAttendanceSummaryRange(startDate, endDate));
    }

    /**
     * Export Excel attendance sheet for either a single day or a date range.
     * Examples:
     *   Single Day:  /api/admin/attendance/export?date=2026-10-01
     *   Date Range:  /api/admin/attendance/export?startDate=2026-10-01&endDate=2026-10-15
     */
    @GetMapping("/admin/attendance/export")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<byte[]> exportAttendanceExcel(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) throws IOException {

        byte[] excelBytes;
        String fileName;

        if (startDate != null && endDate != null) {
            excelBytes = excelService.generateRangeAttendanceExcel(startDate, endDate);
            fileName = String.format("teacher-attendance_%s_to_%s.xlsx", startDate, endDate);
        } else if (date != null) {
            excelBytes = excelService.generateDailyAttendanceExcel(date);
            fileName = String.format("teacher-attendance_%s.xlsx", date);
        } else {
            // Default to today
            LocalDate today = LocalDate.now();
            excelBytes = excelService.generateDailyAttendanceExcel(today);
            fileName = String.format("teacher-attendance_%s.xlsx", today);
        }

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + fileName + "\"")
                .contentType(MediaType.parseMediaType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"))
                .body(excelBytes);
    }

    /**
     * Teacher self-service: View own attendance records.
     */
    @GetMapping("/teacher/attendance/my")
    public ResponseEntity<List<TeacherAttendanceResponse>> getMyAttendance(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate,
            @AuthenticationPrincipal UserPrincipal principal) {

        LocalDate start = (startDate != null) ? startDate : LocalDate.now().withDayOfMonth(1);
        LocalDate end = (endDate != null) ? endDate : LocalDate.now();

        return ResponseEntity.ok(attendanceService.getAttendanceRange(start, end, principal.getId()));
    }
}
