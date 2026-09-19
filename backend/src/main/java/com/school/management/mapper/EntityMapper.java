package com.school.management.mapper;

import com.school.management.dto.response.*;
import com.school.management.model.entity.*;

public final class EntityMapper {

    private EntityMapper() {}

    public static UserResponse toUserResponse(User user) {
        return UserResponse.builder()
                .id(user.getId())
                .username(user.getUsername())
                .fullName(user.getFullName())
                .email(user.getEmail())
                .role(user.getRole())
                .active(user.isActive())
                .performanceScore(user.getPerformanceScore())
                .subject(user.getSubject())
                .createdAt(user.getCreatedAt())
                .build();
    }

    public static PeriodSlotResponse toPeriodSlotResponse(PeriodSlot slot) {
        return PeriodSlotResponse.builder()
                .id(slot.getId())
                .teacherId(slot.getTeacher().getId())
                .teacherName(slot.getTeacher().getFullName())
                .dayOfWeek(slot.getDayOfWeek())
                .periodNumber(slot.getPeriodNumber())
                .periodType(slot.getPeriodType())
                .subject(slot.getSubject())
                .className(slot.getClassName())
                .title(slot.getTitle())
                .build();
    }

    public static MediaFileResponse toMediaFileResponse(MediaFile file) {
        return MediaFileResponse.builder()
                .id(file.getId())
                .originalFileName(file.getOriginalFileName())
                .contentType(file.getContentType())
                .fileSize(file.getFileSize())
                .fileCategory(file.getFileCategory())
                .uploadedByName(file.getUploadedBy().getFullName())
                .uploadedAt(file.getUploadedAt())
                .downloadUrl("/api/files/" + file.getId() + "/download")
                .build();
    }

    public static TeacherNoteResponse toTeacherNoteResponse(TeacherNote note) {
        return TeacherNoteResponse.builder()
                .id(note.getId())
                .teacherId(note.getTeacher().getId())
                .teacherName(note.getTeacher().getFullName())
                .title(note.getTitle())
                .content(note.getContent())
                .createdByName(note.getCreatedBy().getFullName())
                .createdAt(note.getCreatedAt())
                .build();
    }
}
