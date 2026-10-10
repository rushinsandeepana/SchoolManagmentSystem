package com.school.management.service;

import com.school.management.dto.request.TeacherAttendanceItemRequest;
import com.school.management.dto.request.TeacherAttendanceSaveRequest;
import com.school.management.dto.response.DailyTeacherAttendanceResponse;
import com.school.management.dto.response.TeacherAttendanceResponse;
import com.school.management.dto.response.TeacherAttendanceSummaryResponse;
import com.school.management.exception.BadRequestException;
import com.school.management.exception.ResourceNotFoundException;
import com.school.management.model.entity.TeacherAttendance;
import com.school.management.model.entity.User;
import com.school.management.model.enums.AttendanceStatus;
import com.school.management.model.enums.Role;
import com.school.management.repository.TeacherAttendanceRepository;
import com.school.management.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.*;
import java.util.function.Function;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class TeacherAttendanceService {

    private final TeacherAttendanceRepository attendanceRepository;
    private final UserRepository userRepository;

    @Transactional(readOnly = true)
    public DailyTeacherAttendanceResponse getDailyAttendance(LocalDate date) {
        if (date == null) {
            date = LocalDate.now();
        }

        List<User> activeTeachers = getActiveTeachers();
        List<TeacherAttendance> existingRecords = attendanceRepository.findByAttendanceDateWithTeacher(date);

        Map<Long, TeacherAttendance> existingMap = existingRecords.stream()
                .collect(Collectors.toMap(r -> r.getTeacher().getId(), Function.identity(), (a, b) -> a));

        boolean isSaved = !existingRecords.isEmpty();

        List<TeacherAttendanceResponse> responses = new ArrayList<>();
        int presentCount = 0;
        int absentCount = 0;
        int leaveCount = 0;
        int halfDayCount = 0;

        for (User teacher : activeTeachers) {
            TeacherAttendance record = existingMap.get(teacher.getId());
            AttendanceStatus status = (record != null) ? record.getStatus() : AttendanceStatus.PRESENT;
            String remark = (record != null) ? record.getRemark() : null;

            switch (status) {
                case PRESENT -> presentCount++;
                case ABSENT -> absentCount++;
                case LEAVE -> leaveCount++;
                case SHORT_LEAVE -> leaveCount++;
                case HALF_DAY -> halfDayCount++;
            }

            responses.add(TeacherAttendanceResponse.builder()
                    .id(record != null ? record.getId() : null)
                    .teacherId(teacher.getId())
                    .teacherName(teacher.getFullName())
                    .teacherUsername(teacher.getUsername())
                    .teacherEmail(teacher.getEmail())
                    .attendanceDate(date)
                    .status(status)
                    .remark(remark)
                    .startTime(record != null ? record.getStartTime() : null)
                    .endTime(record != null ? record.getEndTime() : null)
                    .createdAt(record != null ? record.getCreatedAt() : null)
                    .updatedAt(record != null ? record.getUpdatedAt() : null)
                    .build());
        }

        return DailyTeacherAttendanceResponse.builder()
                .date(date)
                .totalTeachers(activeTeachers.size())
                .presentCount(presentCount)
                .absentCount(absentCount)
                .leaveCount(leaveCount)
                .halfDayCount(halfDayCount)
                .saved(isSaved)
                .records(responses)
                .build();
    }

    @Transactional
    public DailyTeacherAttendanceResponse saveDailyAttendance(TeacherAttendanceSaveRequest request) {
        if (request.getDate() == null) {
            throw new BadRequestException("Attendance date is required");
        }

        LocalDate date = request.getDate();
        List<User> activeTeachers = getActiveTeachers();
        Map<Long, User> teacherMap = activeTeachers.stream()
                .collect(Collectors.toMap(User::getId, Function.identity()));

        List<TeacherAttendance> existingRecords = attendanceRepository.findByAttendanceDate(date);
        Map<Long, TeacherAttendance> existingMap = existingRecords.stream()
                .collect(Collectors.toMap(r -> r.getTeacher().getId(), Function.identity(), (a, b) -> a));

        List<TeacherAttendance> toSave = new ArrayList<>();

        if (request.getExceptions() != null) {
            // Exceptions-first approach: teachers in exceptions get specified status, others default to PRESENT
            Map<Long, TeacherAttendanceItemRequest> exceptionMap = request.getExceptions().stream()
                    .collect(Collectors.toMap(TeacherAttendanceItemRequest::getTeacherId, Function.identity(), (a, b) -> b));

            for (User teacher : activeTeachers) {
                TeacherAttendanceItemRequest exception = exceptionMap.get(teacher.getId());
                AttendanceStatus status = (exception != null) ? exception.getStatus() : AttendanceStatus.PRESENT;
                String remark = (exception != null) ? exception.getRemark() : null;
                LocalTime startTime = exception != null ? exception.getStartTime() : null;
                LocalTime endTime = exception != null ? exception.getEndTime() : null;

                TeacherAttendance record = existingMap.get(teacher.getId());
                if (record == null) {
                    record = TeacherAttendance.builder()
                            .teacher(teacher)
                            .attendanceDate(date)
                            .status(status)
                            .remark(remark)
                            .startTime(startTime)
                            .endTime(endTime)
                            .build();
                } else {
                    record.setStatus(status);
                    record.setRemark(remark);
                    record.setStartTime(startTime);
                    record.setEndTime(endTime);
                }
                toSave.add(record);
            }
        } else if (request.getRecords() != null) {
            // Full roster list approach
            for (TeacherAttendanceItemRequest item : request.getRecords()) {
                User teacher = teacherMap.get(item.getTeacherId());
                if (teacher == null) {
                    teacher = userRepository.findById(item.getTeacherId())
                            .orElseThrow(() -> new ResourceNotFoundException("Teacher not found: " + item.getTeacherId()));
                }

                TeacherAttendance record = existingMap.get(teacher.getId());
                if (record == null) {
                    record = TeacherAttendance.builder()
                            .teacher(teacher)
                            .attendanceDate(date)
                            .status(item.getStatus())
                            .remark(item.getRemark())
                            .startTime(item.getStartTime())
                            .endTime(item.getEndTime())
                            .build();
                } else {
                    record.setStatus(item.getStatus());
                    record.setRemark(item.getRemark());
                    record.setStartTime(item.getStartTime());
                    record.setEndTime(item.getEndTime());
                }
                toSave.add(record);
            }
        } else {
            throw new BadRequestException("Either 'records' or 'exceptions' list must be provided");
        }

        attendanceRepository.saveAll(toSave);
        log.info("Saved {} teacher attendance records for date {}", toSave.size(), date);

        return getDailyAttendance(date);
    }

    @Transactional(readOnly = true)
    public List<TeacherAttendanceResponse> getAttendanceRange(LocalDate startDate, LocalDate endDate, Long teacherId) {
        validateDateRange(startDate, endDate);

        List<TeacherAttendance> records;
        if (teacherId != null) {
            records = attendanceRepository.findByTeacherIdAndDateRangeWithTeacher(teacherId, startDate, endDate);
        } else {
            records = attendanceRepository.findByDateRangeWithTeacher(startDate, endDate);
        }

        return records.stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<TeacherAttendanceSummaryResponse> getAttendanceSummaryRange(LocalDate startDate, LocalDate endDate) {
        validateDateRange(startDate, endDate);

        List<User> activeTeachers = getActiveTeachers();
        List<TeacherAttendance> records = attendanceRepository.findByDateRangeWithTeacher(startDate, endDate);

        Map<Long, List<TeacherAttendance>> recordsByTeacher = records.stream()
                .collect(Collectors.groupingBy(r -> r.getTeacher().getId()));

        List<TeacherAttendanceSummaryResponse> summaries = new ArrayList<>();

        for (User teacher : activeTeachers) {
            List<TeacherAttendance> teacherRecords = recordsByTeacher.getOrDefault(teacher.getId(), Collections.emptyList());

            int present = 0;
            int absent = 0;
            int leave = 0;
            int halfDay = 0;

            for (TeacherAttendance rec : teacherRecords) {
                switch (rec.getStatus()) {
                    case PRESENT -> present++;
                    case ABSENT -> absent++;
                    case LEAVE -> leave++;
                    case SHORT_LEAVE -> leave++;
                    case HALF_DAY -> halfDay++;
                }
            }

            int totalRecorded = teacherRecords.size();
            double attendancePct = totalRecorded > 0
                    ? Math.round(((present + (halfDay * 0.5)) / totalRecorded) * 1000.0) / 10.0
                    : 0.0;

            summaries.add(TeacherAttendanceSummaryResponse.builder()
                    .teacherId(teacher.getId())
                    .teacherName(teacher.getFullName())
                    .teacherUsername(teacher.getUsername())
                    .presentDays(present)
                    .absentDays(absent)
                    .leaveDays(leave)
                    .halfDays(halfDay)
                    .totalDaysRecorded(totalRecorded)
                    .attendancePercentage(attendancePct)
                    .build());
        }

        return summaries;
    }

    public List<User> getActiveTeachers() {
        return userRepository.findByRoleOrderByFullNameAsc(Role.TEACHER).stream()
                .filter(User::isActive)
                .collect(Collectors.toList());
    }

    private void validateDateRange(LocalDate startDate, LocalDate endDate) {
        if (startDate == null || endDate == null) {
            throw new BadRequestException("Start date and end date are required");
        }
        if (endDate.isBefore(startDate)) {
            throw new BadRequestException("End date cannot be before start date");
        }
    }

    private TeacherAttendanceResponse mapToResponse(TeacherAttendance record) {
        return TeacherAttendanceResponse.builder()
                .id(record.getId())
                .teacherId(record.getTeacher().getId())
                .teacherName(record.getTeacher().getFullName())
                .teacherUsername(record.getTeacher().getUsername())
                .teacherEmail(record.getTeacher().getEmail())
                .attendanceDate(record.getAttendanceDate())
                .status(record.getStatus())
                .remark(record.getRemark())
                .startTime(record.getStartTime())
                .endTime(record.getEndTime())
                .createdAt(record.getCreatedAt())
                .updatedAt(record.getUpdatedAt())
                .build();
    }
}
