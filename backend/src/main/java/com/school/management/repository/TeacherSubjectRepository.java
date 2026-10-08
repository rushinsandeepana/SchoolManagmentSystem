package com.school.management.repository;

import com.school.management.model.entity.TeacherSubject;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface TeacherSubjectRepository
        extends JpaRepository<TeacherSubject, Long> {

    List<TeacherSubject> findByTeacherId(Long teacherId);

    @Modifying
    @Query("DELETE FROM TeacherSubject ts WHERE ts.teacher.id = :teacherId")
    void deleteByTeacherId(@Param("teacherId") Long teacherId);

    boolean existsByTeacherIdAndSubjectId(
            Long teacherId,
            Long subjectId
    );
}