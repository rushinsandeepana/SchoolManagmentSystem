package com.school.management.controller;

import com.school.management.dto.request.CreateClassRequest;
import com.school.management.dto.request.UpdateClassRequest;
import com.school.management.dto.response.ApiMessage;
import com.school.management.dto.response.ClassResponse;
import com.school.management.dto.response.PageResponse;
import com.school.management.service.SchoolClassService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

import java.util.List;

import org.springframework.web.bind.annotation.*;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;


@RestController
@RequestMapping("/api/admin/classes")
@RequiredArgsConstructor
public class ClassController {

    private final SchoolClassService schoolClassService;

    @GetMapping
    public PageResponse<ClassResponse> listClasses(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) String search) {
        return schoolClassService.listClasses(page, size, search);
    }

    @GetMapping("/all")
    public List<ClassResponse> getAllClasses() {
        return schoolClassService.getAllClasses();
    }
    

    @PostMapping
    public ClassResponse createClass(@Valid @RequestBody CreateClassRequest request) {
        return schoolClassService.createClass(request);
    }

    @PutMapping("/{id}")
    public ClassResponse updateClass(
            @PathVariable Long id,
            @Valid @RequestBody UpdateClassRequest request) {
        return schoolClassService.updateClass(id, request);
    }

    @DeleteMapping("/{id}")
    public ApiMessage deleteClass(@PathVariable Long id) {
        schoolClassService.deleteClass(id);
        return new ApiMessage("Class deleted");
    }
}
