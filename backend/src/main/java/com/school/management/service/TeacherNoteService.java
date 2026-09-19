package com.school.management.service;

import com.school.management.dto.request.TeacherNoteRequest;
import com.school.management.dto.response.TeacherNoteResponse;
import com.school.management.exception.BadRequestException;
import com.school.management.exception.ResourceNotFoundException;
import com.school.management.mapper.EntityMapper;
import com.school.management.model.entity.TeacherNote;
import com.school.management.model.entity.User;
import com.school.management.model.enums.Role;
import com.school.management.repository.TeacherNoteRepository;
import com.school.management.security.UserPrincipal;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class TeacherNoteService {

    private final TeacherNoteRepository teacherNoteRepository;
    private final TeacherService teacherService;

    public List<TeacherNoteResponse> listForTeacher(Long teacherId, UserPrincipal currentUser) {
        assertNoteAccess(teacherId, currentUser);
        return teacherNoteRepository.findByTeacherIdOrderByCreatedAtDesc(teacherId).stream()
                .map(EntityMapper::toTeacherNoteResponse)
                .toList();
    }

    @Transactional
    public TeacherNoteResponse create(TeacherNoteRequest request, UserPrincipal currentUser) {
        assertNoteAccess(request.getTeacherId(), currentUser);
        User teacher = teacherService.requireTeacher(request.getTeacherId());
        TeacherNote note = TeacherNote.builder()
                .teacher(teacher)
                .createdBy(currentUser.getUser())
                .title(request.getTitle())
                .content(request.getContent())
                .build();
        return EntityMapper.toTeacherNoteResponse(teacherNoteRepository.save(note));
    }

    @Transactional
    public void delete(Long noteId, UserPrincipal currentUser) {
        TeacherNote note = teacherNoteRepository.findById(noteId)
                .orElseThrow(() -> new ResourceNotFoundException("Note not found"));
        assertNoteAccess(note.getTeacher().getId(), currentUser);
        teacherNoteRepository.delete(note);
    }

    private void assertNoteAccess(Long teacherId, UserPrincipal currentUser) {
        if (currentUser.getUser().getRole() == Role.ADMIN) {
            return;
        }
        if (!currentUser.getId().equals(teacherId)) {
            throw new BadRequestException("You can only manage your own notes");
        }
    }
}
