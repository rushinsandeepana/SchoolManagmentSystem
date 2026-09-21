package com.school.management.service;

import com.school.management.dto.request.AssignPeriodRequest;
import com.school.management.dto.request.PeriodContentRequest;
import com.school.management.dto.response.PageResponse;
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
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;

import java.time.Instant;
import java.util.List;

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
                    Sort.Order.asc("dayOfWeek"),
                    Sort.Order.asc("periodNumber"),
                    Sort.Order.asc("teacher.fullName")))),
            EntityMapper::toPeriodSlotResponse);
    }

    public List<PeriodSlotResponse> getTeacherSchedule(Long teacherId) {
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
        slot.setSubject(request.getSubject());
        slot.setClassName(request.getClassName());
        slot.setTitle(request.getTitle());

        return EntityMapper.toPeriodSlotResponse(periodSlotRepository.save(slot));
    }

    @Transactional
    public void deletePeriod(Long periodId) {
        PeriodSlot slot = requireSlot(periodId);
        mediaFileRepository.deleteByPeriodSlotId(slot.getId());
        periodContentRepository.deleteByPeriodSlotId(slot.getId());
        periodSlotRepository.delete(slot);
    }

    public PeriodDetailResponse getPeriodDetail(Long periodId, UserPrincipal currentUser) {
        PeriodSlot slot = requireSlot(periodId);
        assertCanAccess(slot, currentUser);

        PeriodContent content = periodContentRepository.findByPeriodSlotId(periodId).orElse(null);
        return PeriodDetailResponse.builder()
                .slot(EntityMapper.toPeriodSlotResponse(slot))
                .activityTitle(content != null ? content.getActivityTitle() : null)
                .activityDescription(content != null ? content.getActivityDescription() : null)
                .notes(content != null ? content.getNotes() : null)
                .updatedAt(content != null ? content.getUpdatedAt() : null)
                .files(mediaFileRepository.findByPeriodSlotIdOrderByUploadedAtDesc(periodId).stream()
                        .map(EntityMapper::toMediaFileResponse)
                        .toList())
                .build();
    }

    @Transactional
    public PeriodDetailResponse upsertContent(Long periodId, PeriodContentRequest request, UserPrincipal currentUser) {
        PeriodSlot slot = requireSlot(periodId);
        assertCanAccess(slot, currentUser);

        PeriodContent content = periodContentRepository.findByPeriodSlotId(periodId)
                .orElse(PeriodContent.builder().periodSlot(slot).build());
        content.setActivityTitle(request.getActivityTitle());
        content.setActivityDescription(request.getActivityDescription());
        content.setNotes(request.getNotes());
        content.setUpdatedAt(Instant.now());
        periodContentRepository.save(content);

        return getPeriodDetail(periodId, currentUser);
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
}
