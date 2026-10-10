package com.school.management.repository;

import com.school.management.model.entity.PeriodSlot;
import com.school.management.model.entity.User;
import com.school.management.model.enums.DayOfWeek;
import com.school.management.model.enums.PeriodType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface PeriodSlotRepository extends JpaRepository<PeriodSlot, Long> {
    List<PeriodSlot> findAllByOrderByDayOfWeekAscPeriodNumberAsc();

        @Query("""
                        SELECT p FROM PeriodSlot p
                        WHERE (:periodType IS NULL OR p.periodType = :periodType)
                            AND (
                                :search IS NULL OR :search = '' OR
                                LOWER(p.teacher.fullName) LIKE LOWER(CONCAT('%', :search, '%')) OR
                                LOWER(COALESCE(p.subject, '')) LIKE LOWER(CONCAT('%', :search, '%')) OR
                                LOWER(COALESCE(p.className, '')) LIKE LOWER(CONCAT('%', :search, '%')) OR
                                LOWER(COALESCE(p.title, '')) LIKE LOWER(CONCAT('%', :search, '%'))
                            )
                        """)
        Page<PeriodSlot> searchAssignments(
                        @Param("search") String search,
                        @Param("periodType") PeriodType periodType,
                        Pageable pageable);

    List<PeriodSlot> findByTeacherOrderByDayOfWeekAscPeriodNumberAsc(User teacher);
    List<PeriodSlot> findByTeacherIdOrderByDayOfWeekAscPeriodNumberAsc(Long teacherId);
    @Query("""
            SELECT p.teacher.id FROM PeriodSlot p
            WHERE p.dayOfWeek = :dayOfWeek
              AND p.periodNumber = :periodNumber
            """)
    List<Long> findTeacherIdsByDayOfWeekAndPeriodNumber(
            @Param("dayOfWeek") DayOfWeek dayOfWeek,
            @Param("periodNumber") Integer periodNumber);
    Optional<PeriodSlot> findByTeacherIdAndDayOfWeekAndPeriodNumber(Long teacherId, DayOfWeek dayOfWeek, Integer periodNumber);
    void deleteByTeacherId(Long teacherId);
}
