package com.school.management.service;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.school.management.dto.request.CreateSubjectRequest;
import com.school.management.dto.request.UpdateSubjectRequest;
import com.school.management.dto.response.PageResponse;
import com.school.management.dto.response.SubjectResponse;
import com.school.management.exception.BadRequestException;
import com.school.management.exception.ResourceNotFoundException;
import com.school.management.mapper.EntityMapper;
import com.school.management.model.entity.Subject;
import com.school.management.repository.SubjectRepository;

import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;

import lombok.RequiredArgsConstructor;

@Service 
@RequiredArgsConstructor 
public class SubjectService {

    private final SubjectRepository subjectRepository;

    @Transactional
    public SubjectResponse createSubject(CreateSubjectRequest request) {
        String code = request.getSubjectCode().trim();
        if (subjectRepository.existsBySubjectCodeIgnoreCase(code)) {
            throw new BadRequestException("Subject code already exists");
        }

        Subject subject = Subject.builder()
                .subjectName(request.getSubjectName().trim())
                .subjectCode(code)
                .subjectType(request.getSubjectType())
                .active(request.getActive())
                .build();
        return EntityMapper.toSubjectResponse(subjectRepository.save(subject));
    }

    @Transactional(readOnly = true)
    public PageResponse<SubjectResponse> listSubjects(int page, int size, String search) {
        int safePage = Math.max(page, 0);
        int safeSize = size <= 0 ? 10 : Math.min(size, 100);
        String query = search == null ? "" : search.trim();
        return PageResponse.from(
                subjectRepository.search(query, PageRequest.of(safePage, safeSize, Sort.by(Sort.Direction.ASC, "subjectName"))),
                EntityMapper::toSubjectResponse);
    }

    @Transactional
    public SubjectResponse updateSubject(Long id, UpdateSubjectRequest request) {
        Subject subject = requireSubject(id);
        String code = request.getSubjectCode().trim();
        if (subjectRepository.existsBySubjectCodeIgnoreCaseAndIdNot(code, id)) {
            throw new BadRequestException("Subject code already exists");
        }
        subject.setSubjectName(request.getSubjectName().trim());
        subject.setSubjectCode(code);
        subject.setSubjectType(request.getSubjectType());
        subject.setActive(request.getActive());
        return EntityMapper.toSubjectResponse(subjectRepository.save(subject));
    }

    @Transactional
    public void deleteSubject(Long id) {
        subjectRepository.delete(requireSubject(id));
    }

    private Subject requireSubject(Long id) {
        return subjectRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Subject not found"));
    }
}
