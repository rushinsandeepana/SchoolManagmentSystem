package com.school.management.repository;

import com.school.management.model.entity.SchoolClass;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface SchoolClassRepository extends JpaRepository<SchoolClass, Long> {
    boolean existsByGradeIgnoreCaseAndSectionIgnoreCase(String grade, String section);

    boolean existsByGradeIgnoreCaseAndSectionIgnoreCaseAndIdNot(String grade, String section, Long id);

    @Query("""
                SELECT c FROM SchoolClass c
                LEFT JOIN c.classTeacher teacher
            WHERE :search IS NULL OR :search = ''
               OR LOWER(c.grade) LIKE LOWER(CONCAT('%', :search, '%'))
               OR LOWER(c.section) LIKE LOWER(CONCAT('%', :search, '%'))
                    OR LOWER(COALESCE(teacher.fullName, '')) LIKE LOWER(CONCAT('%', :search, '%'))
            ORDER BY c.grade ASC, c.section ASC
            """)
    Page<SchoolClass> search(@Param("search") String search, Pageable pageable);
}
