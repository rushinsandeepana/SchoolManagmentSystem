package com.school.management.repository;

import com.school.management.model.entity.Subject;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface SubjectRepository extends JpaRepository<Subject, Long> {
    boolean existsBySubjectCodeIgnoreCase(String subjectCode);

    boolean existsBySubjectCodeIgnoreCaseAndIdNot(String subjectCode, Long id);

    @Query("""
            SELECT s FROM Subject s
            WHERE :search IS NULL OR :search = ''
               OR LOWER(s.subjectName) LIKE LOWER(CONCAT('%', :search, '%'))
               OR LOWER(s.subjectCode) LIKE LOWER(CONCAT('%', :search, '%'))
               OR LOWER(CAST(s.subjectType AS string)) LIKE LOWER(CONCAT('%', :search, '%'))
            ORDER BY s.subjectName ASC
            """)
    Page<Subject> search(@Param("search") String search, Pageable pageable);
}
