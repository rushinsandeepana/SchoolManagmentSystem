package com.school.management.controller;

import com.school.management.dto.request.AssignPeriodRequest;
import com.school.management.dto.request.CreateTeacherRequest;
import com.school.management.dto.request.TeacherNoteRequest;
import com.school.management.dto.request.UpdateTeacherRequest;
import com.school.management.dto.response.*;
import com.school.management.security.UserPrincipal;
import com.school.management.service.PeriodService;
import com.school.management.service.TeacherNoteService;
import com.school.management.service.TeacherService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Slf4j 
@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
public class AdminController {

    private final TeacherService teacherService;
    private final PeriodService periodService;
    private final TeacherNoteService teacherNoteService;

    @GetMapping("/dashboard")
    public DashboardResponse dashboard() {
        return teacherService.dashboard();
    }

    @GetMapping("/teachers")
    public PageResponse<UserResponse> listTeachers(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) String search) {
        return teacherService.listTeachers(page, size, search);
    }

    @GetMapping("/all/teachers")
    public List<UserResponse> getAllTeachers() {
        return teacherService.getAllTeachers();
    }

    @GetMapping("/teachers/{id}")
    public UserResponse getTeacher(@PathVariable Long id) {
        return teacherService.getTeacher(id);
    }

    @PostMapping("/teachers")
    public UserResponse createTeacher(@Valid @RequestBody CreateTeacherRequest request) {
        return teacherService.createTeacher(request);
    }

    @PutMapping("/teachers/{id}")
    public UserResponse updateTeacher(@PathVariable Long id, @Valid @RequestBody UpdateTeacherRequest request) {
        return teacherService.updateTeacher(id, request);
    }

    @DeleteMapping("/teachers/{id}")
    public ApiMessage deleteTeacher(@PathVariable Long id) {
        teacherService.deleteTeacher(id);
        return new ApiMessage("Teacher deleted");
    }

    @GetMapping("/teachers/{id}/schedule")
    public List<PeriodSlotResponse> teacherSchedule(@PathVariable Long id) {
        return periodService.getTeacherSchedule(id);
    }

    @PostMapping("/periods")
    public PeriodSlotResponse assignPeriod(@Valid @RequestBody AssignPeriodRequest request) {
        log.info("AssignPeriodRequest: {}", request);
        return periodService.assignPeriod(request);
    }

    @DeleteMapping("/periods/{id}")
    public ApiMessage deletePeriod(@PathVariable Long id) {
        periodService.deletePeriod(id);
        return new ApiMessage("Period deleted");
    }

    @PostMapping("/notes")
    public TeacherNoteResponse addNote(
            @Valid @RequestBody TeacherNoteRequest request,
            @AuthenticationPrincipal UserPrincipal principal) {
        return teacherNoteService.create(request, principal);
    }

    @GetMapping("/teachers/{id}/notes")
    public PageResponse<TeacherNoteResponse> teacherNotes(
            @PathVariable Long id,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) String search,
            @AuthenticationPrincipal UserPrincipal principal) {
        return teacherNoteService.listForTeacher(id, principal, page, size, search);
    }

    @DeleteMapping("/notes/{id}")
    public ApiMessage deleteNote(
            @PathVariable Long id,
            @AuthenticationPrincipal UserPrincipal principal) {
        teacherNoteService.delete(id, principal);
        return new ApiMessage("Note deleted");
    }
}
