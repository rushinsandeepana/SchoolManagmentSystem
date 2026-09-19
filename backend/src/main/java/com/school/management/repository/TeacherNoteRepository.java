package com.school.management.repository;

import com.school.management.model.entity.TeacherNote;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface TeacherNoteRepository extends JpaRepository<TeacherNote, Long> {
    List<TeacherNote> findByTeacherIdOrderByCreatedAtDesc(Long teacherId);
    void deleteByTeacherId(Long teacherId);
}
