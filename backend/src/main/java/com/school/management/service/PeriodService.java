package com.school.management.service;

import com.school.management.dto.request.AssignPeriodRequest;
import com.school.management.dto.request.PeriodContentRequest;
import com.school.management.dto.response.PageResponse;
import com.school.management.dto.response.PeriodContentResponse;
import com.school.management.dto.response.PeriodDetailResponse;
import com.school.management.dto.response.PeriodSlotResponse;
import com.school.management.exception.BadRequestException;
import com.school.management.exception.ResourceNotFoundException;
import com.school.management.mapper.EntityMapper;
import com.school.management.model.entity.PeriodContent;
import com.school.management.model.entity.PeriodSlot;
import com.school.management.model.entity.User;
import com.school.management.model.enums.Role;
import com.school.management.model.enums.PeriodType;
import com.school.management.repository.MediaFileRepository;
import com.school.management.repository.PeriodContentRepository;
import com.school.management.repository.PeriodSlotRepository;
import com.school.management.repository.UserRepository;
import com.school.management.security.UserPrincipal;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;

import java.time.Instant;
import java.util.List;

@Slf4j 
@Service
@RequiredArgsConstructor
public class PeriodService {

    private final PeriodSlotRepository periodSlotRepository;
    private final PeriodContentRepository periodContentRepository;
    private final MediaFileRepository mediaFileRepository;
    private final UserRepository userRepository;
    private final TeacherService teacherService;

    public List<PeriodSlotResponse> getAllAssignments() {
        return periodSlotRepository.findAllByOrderByDayOfWeekAscPeriodNumberAsc().stream()
                .map(EntityMapper::toPeriodSlotResponse)
                .toList();
    }

    public PageResponse<PeriodSlotResponse> listAssignments(int page, int size, String search, PeriodType periodType) {
        int safePage = Math.max(page, 0);
        int safeSize = size <= 0 ? 10 : Math.min(size, 100);
        String query = search == null ? "" : search.trim();
        return PageResponse.from(
            periodSlotRepository.searchAssignments(
                query,
                periodType,
                PageRequest.of(safePage, safeSize, Sort.by(
                    Sort.Order.desc("id")
                    // Sort.Order.asc("periodNumber"),
                    // Sort.Order.asc("teacher.fullName")
                ))),
            EntityMapper::toPeriodSlotResponse);
    }

    public List<PeriodSlotResponse> getTeacherSchedule(Long teacherId) {
        log.info("teacherId: {}", teacherId);
        teacherService.requireTeacher(teacherId);
        return periodSlotRepository.findByTeacherIdOrderByDayOfWeekAscPeriodNumberAsc(teacherId).stream()
                .map(EntityMapper::toPeriodSlotResponse)
                .toList();
    }

    @Transactional
    public PeriodSlotResponse assignPeriod(AssignPeriodRequest request) {
        User teacher = teacherService.requireTeacher(request.getTeacherId());

        PeriodSlot slot = periodSlotRepository
                .findByTeacherIdAndDayOfWeekAndPeriodNumber(
                        request.getTeacherId(), request.getDayOfWeek(), request.getPeriodNumber())
                .orElse(PeriodSlot.builder()
                        .teacher(teacher)
                        .dayOfWeek(request.getDayOfWeek())
                        .periodNumber(request.getPeriodNumber())
                        .build());

        slot.setPeriodType(request.getPeriodType());
        slot.setDate(request.getDate());
        slot.setSubject(request.getSubject());
        slot.setClassName(request.getClassName());
        slot.setTitle(request.getTitle());

        return EntityMapper.toPeriodSlotResponse(periodSlotRepository.save(slot));
    }

    @Transactional
    public void deletePeriod(Long periodId) {
        PeriodSlot slot = requireSlot(periodId);

        List<PeriodContent> contents =
                periodContentRepository.findByPeriodSlotIdOrderByIdAsc(slot.getId());

        for (PeriodContent content : contents) {
            mediaFileRepository.deleteByPeriodContentId(content.getId());
        }

        periodContentRepository.deleteByPeriodSlotId(slot.getId());
        periodSlotRepository.delete(slot);
    }

    public PeriodDetailResponse getPeriodDetail(Long periodId, UserPrincipal currentUser) {
        PeriodSlot slot = requireSlot(periodId);
        assertCanAccess(slot, currentUser);

        List<PeriodContent> contents =
                periodContentRepository.findByPeriodSlotIdOrderByIdAsc(periodId);

        List<PeriodContentResponse> contentResponses = contents.stream()
                .map(content -> PeriodContentResponse.builder()
                        .id(content.getId())
                        .activityTitle(content.getActivityTitle())
                        .activityDescription(content.getActivityDescription())
                        .notes(content.getNotes())
                        .updatedAt(content.getUpdatedAt())
                        .files(
                                mediaFileRepository
                                        .findByPeriodContentIdOrderByUploadedAtDesc(content.getId())
                                        .stream()
                                        .map(EntityMapper::toMediaFileResponse)
                                        .toList()
                        )
                        .build())
                .toList();

        return PeriodDetailResponse.builder()
                .slot(EntityMapper.toPeriodSlotResponse(slot))
                .contents(contentResponses)
                .build();
    }

    @Transactional
    public PeriodContentResponse createContent(
            Long periodId,
            PeriodContentRequest request,
            UserPrincipal currentUser) {

        PeriodSlot slot = requireSlot(periodId);
        assertCanAccess(slot, currentUser);

        PeriodContent content = PeriodContent.builder()
                .periodSlot(slot)
                .activityTitle(request.getActivityTitle())
                .activityDescription(request.getActivityDescription())
                .notes(request.getNotes())
                .updatedAt(Instant.now())
                .build();

        PeriodContent saved = periodContentRepository.save(content);

        return PeriodContentResponse.builder()
                .id(saved.getId())
                .activityTitle(saved.getActivityTitle())
                .activityDescription(saved.getActivityDescription())
                .notes(saved.getNotes())
                .updatedAt(saved.getUpdatedAt())
                .files(List.of())
                .build();
    }

    public PeriodSlot requireSlot(Long id) {
        return periodSlotRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Period not found"));
    }

    public void assertCanAccess(PeriodSlot slot, UserPrincipal currentUser) {
        if (currentUser.getUser().getRole() == Role.ADMIN) {
            return;
        }
        if (!slot.getTeacher().getId().equals(currentUser.getId())) {
            throw new BadRequestException("You can only access your own periods");
        }
    }

    public User requireUser(Long id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
    }

    @Transactional
    public void deleteContent(
            Long periodId,
            Long contentId,
            UserPrincipal currentUser) {

        PeriodSlot slot = requireSlot(periodId);
        assertCanAccess(slot, currentUser);

        PeriodContent content = periodContentRepository
                .findById(contentId)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Period content not found"));

        if (!content.getPeriodSlot().getId().equals(periodId)) {
            throw new BadRequestException(
                    "Content does not belong to this period");
        }

        mediaFileRepository.deleteByPeriodContentId(contentId);

        periodContentRepository.delete(content);
    }
}
