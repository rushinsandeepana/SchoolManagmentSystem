package com.school.management.controller;

import com.school.management.dto.request.CreateTimetableBatchRequest;
import com.school.management.dto.request.TimetableRequest;
import com.school.management.dto.response.ApiMessage;
import com.school.management.dto.response.TimetableResponse;
import com.school.management.service.TimetableService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

@Slf4j 
@RestController
@RequestMapping("/api/admin/timetables")
@RequiredArgsConstructor
public class TimetableController {

    private final TimetableService timetableService;

    // =========================================================
    // CREATE
    // =========================================================

    @PostMapping
    public TimetableResponse create(
            @Valid @RequestBody TimetableRequest request) {

        return timetableService.create(request);
    }

    @PostMapping("/batch")
        public List<TimetableResponse> createBatch(
                @Valid @RequestBody CreateTimetableBatchRequest request) {

        return timetableService.createBatch(request);
    }

    // =========================================================
    // GET ALL / FILTER
    // =========================================================

    @GetMapping
    public List<TimetableResponse> getAll(
            @RequestParam(required = false) Long teacherId,
            @RequestParam(required = false) Long classId,
            @RequestParam(required = false) Long subjectId,
            @RequestParam(required = false) LocalDateTime createdAt
        ) {

                return timetableService.getAll(
                teacherId,
                classId,
                subjectId,
                createdAt
        );
    }

    // =========================================================
    // GET BY ID
    // =========================================================

    @GetMapping("/{id}")
    public TimetableResponse getById(
            @PathVariable Long id) {

        return timetableService.getById(id);
    }

    // =========================================================
    // PATCH / UPDATE
    // =========================================================

    @PatchMapping("/{id}")
    public TimetableResponse update(
            @PathVariable Long id,
            @Valid @RequestBody TimetableRequest request) {

        return timetableService.update(
                id,
                request
        );
    }

    // =========================================================
    // DELETE ALL TIMETABLES FOR TEACHER
    // =========================================================

    @DeleteMapping("/teacher/{teacherId}")
    public ApiMessage deleteByTeacher(
            @PathVariable Long teacherId) {

        timetableService.deleteByTeacher(teacherId);

        return new ApiMessage(
                "Teacher timetable deleted"
        );
    }

    // =========================================================
    // DELETE TEACHER + SUBJECT GROUP
    // =========================================================

    @DeleteMapping("/teacher/{teacherId}/subject/{subjectId}")
    public ApiMessage deleteByTeacherAndSubject(
            @PathVariable Long teacherId,
            @PathVariable Long subjectId) {

        timetableService.deleteByTeacherAndSubject(
                teacherId,
                subjectId
        );

        return new ApiMessage(
                "Teacher subject timetable deleted"
        );
    }

    // =========================================================
    // DELETE ONE TIMETABLE SLOT
    // =========================================================

    @DeleteMapping("/{id}")
    public ApiMessage delete(
            @PathVariable Long id) {

        timetableService.delete(id);

        return new ApiMessage(
                "Timetable deleted"
        );
    }
}