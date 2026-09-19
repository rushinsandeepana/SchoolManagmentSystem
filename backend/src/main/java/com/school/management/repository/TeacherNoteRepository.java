package com.school.management.repository;

import com.school.management.model.entity.TeacherNote;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface TeacherNoteRepository extends JpaRepository<TeacherNote, Long> {
    List<TeacherNote> findByTeacherIdOrderByCreatedAtDesc(Long teacherId);
    void deleteByTeacherId(Long teacherId);

    @Query("""
            SELECT n FROM TeacherNote n
            WHERE n.teacher.id = :teacherId
              AND (
                :search IS NULL OR :search = '' OR
                LOWER(n.title) LIKE LOWER(CONCAT('%', :search, '%')) OR
                LOWER(n.content) LIKE LOWER(CONCAT('%', :search, '%'))
              )
            """)
    Page<TeacherNote> searchByTeacherId(
            @Param("teacherId") Long teacherId,
            @Param("search") String search,
            Pageable pageable);
}
