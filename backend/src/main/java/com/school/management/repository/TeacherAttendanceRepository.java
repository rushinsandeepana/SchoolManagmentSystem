package com.school.management.repository;

import com.school.management.model.entity.TeacherAttendance;
import com.school.management.model.enums.AttendanceStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface TeacherAttendanceRepository extends JpaRepository<TeacherAttendance, Long> {

    List<TeacherAttendance> findByAttendanceDate(LocalDate attendanceDate);

    Optional<TeacherAttendance> findByTeacherIdAndAttendanceDate(Long teacherId, LocalDate attendanceDate);

    List<TeacherAttendance> findByTeacherIdAndAttendanceDateBetweenOrderByAttendanceDateAsc(
            Long teacherId, LocalDate startDate, LocalDate endDate);

    long countByAttendanceDateAndStatus(LocalDate attendanceDate, AttendanceStatus status);

    @Query("SELECT ta FROM TeacherAttendance ta JOIN FETCH ta.teacher t WHERE ta.attendanceDate = :date ORDER BY t.fullName ASC")
    List<TeacherAttendance> findByAttendanceDateWithTeacher(@Param("date") LocalDate date);

    @Query("SELECT ta FROM TeacherAttendance ta JOIN FETCH ta.teacher t WHERE ta.attendanceDate BETWEEN :startDate AND :endDate ORDER BY ta.attendanceDate ASC, t.fullName ASC")
    List<TeacherAttendance> findByDateRangeWithTeacher(
            @Param("startDate") LocalDate startDate,
            @Param("endDate") LocalDate endDate);

    @Query("SELECT ta FROM TeacherAttendance ta JOIN FETCH ta.teacher t WHERE t.id = :teacherId AND ta.attendanceDate BETWEEN :startDate AND :endDate ORDER BY ta.attendanceDate ASC")
    List<TeacherAttendance> findByTeacherIdAndDateRangeWithTeacher(
            @Param("teacherId") Long teacherId,
            @Param("startDate") LocalDate startDate,
            @Param("endDate") LocalDate endDate);
}
