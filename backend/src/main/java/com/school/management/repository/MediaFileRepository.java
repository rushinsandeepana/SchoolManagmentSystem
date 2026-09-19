package com.school.management.repository;

import com.school.management.model.entity.MediaFile;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface MediaFileRepository extends JpaRepository<MediaFile, Long> {
    List<MediaFile> findByPeriodSlotIdOrderByUploadedAtDesc(Long periodSlotId);
    void deleteByPeriodSlotId(Long periodSlotId);
}
