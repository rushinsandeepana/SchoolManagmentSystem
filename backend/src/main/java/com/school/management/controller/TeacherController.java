package com.school.management.controller;

import com.school.management.dto.request.PeriodContentRequest;
import com.school.management.dto.request.TeacherNoteRequest;
import com.school.management.dto.response.ApiMessage;
import com.school.management.dto.response.PageResponse;
import com.school.management.dto.response.PeriodDetailResponse;
import com.school.management.dto.response.PeriodSlotResponse;
import com.school.management.dto.response.TeacherNoteResponse;
import com.school.management.security.UserPrincipal;
import com.school.management.service.PeriodService;
import com.school.management.service.TeacherNoteService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/teacher")
@RequiredArgsConstructor
public class TeacherController {

    private final PeriodService periodService;
    private final TeacherNoteService teacherNoteService;

    @GetMapping("/schedule")
    public List<PeriodSlotResponse> mySchedule(@AuthenticationPrincipal UserPrincipal principal) {
        return periodService.getTeacherSchedule(principal.getId());
    }

    @GetMapping("/periods/{id}")
    public PeriodDetailResponse periodDetail(
            @PathVariable Long id,
            @AuthenticationPrincipal UserPrincipal principal) {
        return periodService.getPeriodDetail(id, principal);
    }

    // @PutMapping("/periods/{id}/content")
    // public PeriodDetailResponse upsertContent(
    //         @PathVariable Long id,
    //         @RequestBody PeriodContentRequest request,
    //         @AuthenticationPrincipal UserPrincipal principal) {
    //     return periodService.upsertContent(id, request, principal);
    // }

    @GetMapping("/notes")
    public PageResponse<TeacherNoteResponse> myNotes(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) String search,
            @AuthenticationPrincipal UserPrincipal principal) {
        return teacherNoteService.listForTeacher(principal.getId(), principal, page, size, search);
    }

    @PostMapping("/notes")
    public TeacherNoteResponse addNote(
            @Valid @RequestBody TeacherNoteRequest request,
            @AuthenticationPrincipal UserPrincipal principal) {
        request.setTeacherId(principal.getId());
        return teacherNoteService.create(request, principal);
    }

    @DeleteMapping("/notes/{id}")
    public ApiMessage deleteNote(
            @PathVariable Long id,
            @AuthenticationPrincipal UserPrincipal principal) {
        teacherNoteService.delete(id, principal);
        return new ApiMessage("Note deleted");
    }
}
