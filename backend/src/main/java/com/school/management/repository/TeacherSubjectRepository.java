package com.school.management.repository;

import com.school.management.model.entity.TeacherSubject;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface TeacherSubjectRepository
        extends JpaRepository<TeacherSubject, Long> {

    List<TeacherSubject> findByTeacherId(Long teacherId);

    void deleteByTeacherId(Long teacherId);

    boolean existsByTeacherIdAndSubjectId(
            Long teacherId,
            Long subjectId
    );
}