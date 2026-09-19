package com.school.management.repository;

import com.school.management.model.entity.PeriodContent;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface PeriodContentRepository extends JpaRepository<PeriodContent, Long> {
    Optional<PeriodContent> findByPeriodSlotId(Long periodSlotId);
    void deleteByPeriodSlotId(Long periodSlotId);
}
