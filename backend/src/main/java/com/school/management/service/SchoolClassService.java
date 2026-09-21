package com.school.management.service;

import com.school.management.dto.request.CreateClassRequest;
import com.school.management.dto.request.UpdateClassRequest;
import com.school.management.dto.response.ClassResponse;
import com.school.management.dto.response.PageResponse;
import com.school.management.exception.BadRequestException;
import com.school.management.exception.ResourceNotFoundException;
import com.school.management.mapper.EntityMapper;
import com.school.management.model.entity.SchoolClass;
import com.school.management.model.entity.User;
import com.school.management.repository.SchoolClassRepository;
import com.school.management.repository.UserRepository;
import lombok.RequiredArgsConstructor;

import java.util.List;

import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class SchoolClassService {

    private final SchoolClassRepository schoolClassRepository;
    private final UserRepository userRepository;

    @Transactional(readOnly = true)
    public PageResponse<ClassResponse> listClasses(int page, int size, String search) {
        int safePage = Math.max(page, 0);
        int safeSize = size <= 0 ? 10 : Math.min(size, 100);
        String query = search == null ? "" : search.trim();
        return PageResponse.from(
                schoolClassRepository.search(query, PageRequest.of(safePage, safeSize,
                        Sort.by(Sort.Direction.ASC, "grade").and(Sort.by(Sort.Direction.ASC, "section")))),
                EntityMapper::toClassResponse);
    }

    @Transactional 
    public List<ClassResponse> getAllClasses() {
        return schoolClassRepository.findAll(
                Sort.by(Sort.Direction.ASC, "grade").and(Sort.by(Sort.Direction.ASC, "section")))
                .stream()
                .map(EntityMapper::toClassResponse)
                .toList();
    }

    @Transactional
    public ClassResponse createClass(CreateClassRequest request) {
        String grade = request.getGrade().trim();
        String section = request.getSection().trim().toUpperCase();
        ensureUnique(grade, section, null);

        SchoolClass schoolClass = SchoolClass.builder()
                .grade(grade)
                .section(section)
                .description(trimToNull(request.getDescription()))
                .capacity(request.getCapacity())
            .classTeacher(resolveTeacher(request.getClassTeacherId()))
                .active(request.getActive())
                .build();
        return EntityMapper.toClassResponse(schoolClassRepository.save(schoolClass));
    }

    @Transactional
    public ClassResponse updateClass(Long id, UpdateClassRequest request) {
        SchoolClass schoolClass = requireClass(id);
        String grade = request.getGrade().trim();
        String section = request.getSection().trim().toUpperCase();
        ensureUnique(grade, section, id);

        schoolClass.setGrade(grade);
        schoolClass.setSection(section);
        schoolClass.setDescription(trimToNull(request.getDescription()));
        schoolClass.setCapacity(request.getCapacity());
        schoolClass.setClassTeacher(resolveTeacher(request.getClassTeacherId()));
        schoolClass.setActive(request.getActive());
        return EntityMapper.toClassResponse(schoolClassRepository.save(schoolClass));
    }

    @Transactional
    public void deleteClass(Long id) {
        schoolClassRepository.delete(requireClass(id));
    }

    private void ensureUnique(String grade, String section, Long id) {
        boolean exists = id == null
                ? schoolClassRepository.existsByGradeIgnoreCaseAndSectionIgnoreCase(grade, section)
                : schoolClassRepository.existsByGradeIgnoreCaseAndSectionIgnoreCaseAndIdNot(grade, section, id);
        if (exists) {
            throw new BadRequestException("A class with this grade and section already exists");
        }
    }

    private SchoolClass requireClass(Long id) {
        return schoolClassRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Class not found"));
    }

    private String trimToNull(String value) {
        if (value == null) return null;
        String trimmed = value.trim();
        return trimmed.isEmpty() ? null : trimmed;
    }

    private User resolveTeacher(Long teacherId) {
        if (teacherId == null) return null;
        return userRepository.findById(teacherId)
                .orElseThrow(() -> new ResourceNotFoundException("Teacher not found"));
    }
}
