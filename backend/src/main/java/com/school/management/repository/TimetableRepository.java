package com.school.management.repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.school.management.model.entity.Timetable;

public interface TimetableRepository extends JpaRepository<Timetable, Long> {

    List<Timetable> findByTeacherId(Long teacherId);

    List<Timetable> findBySubjectId(Long subjectId);

    List<Timetable> findBySchoolClassId(Long classId);

    List<Timetable> findByDay(String day);

    List<Timetable> findByTeacherIdAndDay(
            Long teacherId,
            String day
    );

    List<Timetable> findBySchoolClassIdAndDay(
            Long classId,
            String day
    );

    void deleteByTeacherId(Long teacherId);

    void deleteByTeacherIdAndSubjectId(
            Long teacherId,
            Long subjectId
    );

    List<Timetable> findByTeacherIdAndSchoolClassId(
            Long teacherId,
            Long classId
    );

    List<Timetable> findByTeacherIdAndSubjectId(
            Long teacherId,
            Long subjectId
    );

    List<Timetable> findBySchoolClassIdAndSubjectId(
            Long classId,
            Long subjectId
    );

    List<Timetable> findByTeacherIdAndSchoolClassIdAndSubjectIdAndCreatedAt(
            Long teacherId,
            Long classId,
            Long subjectId,
            LocalDateTime createdAt
    );

    boolean existsByTeacherIdAndDayAndPeriod(
            Long teacherId,
            String day,
            Integer period
    );

    boolean existsByTeacherIdAndDayAndPeriodAndIdNot(
            Long teacherId,
            String day,
            Integer period,
            Long id
    );

    boolean existsBySchoolClassIdAndDayAndPeriod(
            Long classId,
            String day,
            Integer period
    );

    boolean existsBySchoolClassIdAndDayAndPeriodAndIdNot(
            Long classId,
            String day,
            Integer period,
            Long id
    );

    boolean existsByTeacherIdAndSubjectIdAndSchoolClassIdAndDayAndPeriod(
            Long teacherId,
            Long subjectId,
            Long classId,
            String day,
            Integer period
    );

    boolean existsByTeacherIdAndSubjectIdAndSchoolClassIdAndDayAndPeriodAndIdNot(
            Long teacherId,
            Long subjectId,
            Long classId,
            String day,
            Integer period,
            Long id
    );

    Optional<Timetable> findByTeacherIdAndDayAndPeriod(
            Long teacherId,
            String day,
            Integer period
    );

    Optional<Timetable> findBySchoolClassIdAndDayAndPeriod(
            Long classId,
            String day,
            Integer period
    );
}