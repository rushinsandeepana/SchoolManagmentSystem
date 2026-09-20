package com.school.management.controller;

import com.school.management.dto.request.CreateSubjectRequest;
import com.school.management.dto.request.UpdateSubjectRequest;
import com.school.management.dto.response.ApiMessage;
import com.school.management.dto.response.PageResponse;
import com.school.management.dto.response.SubjectResponse;
import com.school.management.service.SubjectService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/admin/subjects")
@RequiredArgsConstructor
public class SubjectController {

    private final SubjectService subjectService;

    @GetMapping
    public PageResponse<SubjectResponse> listSubjects(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) String search) {
        return subjectService.listSubjects(page, size, search);
    }

    @PostMapping
    public SubjectResponse createSubject(@Valid @RequestBody CreateSubjectRequest request) {
        return subjectService.createSubject(request);
    }

    @PutMapping("/{id}")
    public SubjectResponse updateSubject(
            @PathVariable Long id,
            @Valid @RequestBody UpdateSubjectRequest request) {
        return subjectService.updateSubject(id, request);
    }

    @DeleteMapping("/{id}")
    public ApiMessage deleteSubject(@PathVariable Long id) {
        subjectService.deleteSubject(id);
        return new ApiMessage("Subject deleted");
    }
}
