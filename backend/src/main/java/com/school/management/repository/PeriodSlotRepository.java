package com.school.management.repository;

import com.school.management.model.entity.PeriodSlot;
import com.school.management.model.entity.User;
import com.school.management.model.enums.DayOfWeek;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface PeriodSlotRepository extends JpaRepository<PeriodSlot, Long> {
    List<PeriodSlot> findByTeacherOrderByDayOfWeekAscPeriodNumberAsc(User teacher);
    List<PeriodSlot> findByTeacherIdOrderByDayOfWeekAscPeriodNumberAsc(Long teacherId);
    Optional<PeriodSlot> findByTeacherIdAndDayOfWeekAndPeriodNumber(Long teacherId, DayOfWeek dayOfWeek, Integer periodNumber);
    void deleteByTeacherId(Long teacherId);
}
