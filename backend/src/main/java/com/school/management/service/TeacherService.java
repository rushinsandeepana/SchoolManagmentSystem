package com.school.management.service;

import com.school.management.dto.request.CreateTeacherRequest;
import com.school.management.dto.request.UpdateTeacherRequest;
import com.school.management.dto.response.DashboardResponse;
import com.school.management.dto.response.PageResponse;
import com.school.management.dto.response.UserResponse;
import com.school.management.exception.BadRequestException;
import com.school.management.exception.ResourceNotFoundException;
import com.school.management.mapper.EntityMapper;
import com.school.management.model.entity.User;
import com.school.management.model.enums.Role;
import com.school.management.repository.MediaFileRepository;
import com.school.management.repository.PeriodContentRepository;
import com.school.management.repository.PeriodSlotRepository;
import com.school.management.repository.TeacherNoteRepository;
import com.school.management.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class TeacherService {

    private final UserRepository userRepository;
    private final PeriodSlotRepository periodSlotRepository;
    private final PeriodContentRepository periodContentRepository;
    private final MediaFileRepository mediaFileRepository;
    private final TeacherNoteRepository teacherNoteRepository;
    private final PasswordEncoder passwordEncoder;

    public List<UserResponse> listTeachers() {
        return userRepository.findByRoleOrderByFullNameAsc(Role.TEACHER).stream()
                .map(EntityMapper::toUserResponse)
                .toList();
    }

    public PageResponse<UserResponse> listTeachers(int page, int size, String search) {
        int safePage = Math.max(page, 0);
        int safeSize = size <= 0 ? 10 : Math.min(size, 100);
        String query = search == null ? "" : search.trim();
        return PageResponse.from(
                userRepository.searchByRole(
                        Role.TEACHER,
                        query,
                        PageRequest.of(safePage, safeSize, Sort.by(Sort.Direction.ASC, "fullName"))),
                EntityMapper::toUserResponse);
    }

    public UserResponse getTeacher(Long id) {
        return EntityMapper.toUserResponse(requireTeacher(id));
    }

    @Transactional
    public UserResponse createTeacher(CreateTeacherRequest request) {
        if (userRepository.existsByUsername(request.getUsername())) {
            throw new BadRequestException("Username already exists");
        }
        User teacher = User.builder()
                .username(request.getUsername())
                .password(passwordEncoder.encode(request.getPassword()))
                .fullName(request.getFullName())
                .email(request.getEmail())
                .subject(request.getSubject())
                .performanceScore(request.getPerformanceScore() != null ? request.getPerformanceScore() : 0.0)
                .role(Role.TEACHER)
                .active(true)
                .build();
        return EntityMapper.toUserResponse(userRepository.save(teacher));
    }

    @Transactional
    public UserResponse updateTeacher(Long id, UpdateTeacherRequest request) {
        User teacher = requireTeacher(id);
        if (request.getFullName() != null) teacher.setFullName(request.getFullName());
        if (request.getEmail() != null) teacher.setEmail(request.getEmail());
        if (request.getSubject() != null) teacher.setSubject(request.getSubject());
        if (request.getPerformanceScore() != null) teacher.setPerformanceScore(request.getPerformanceScore());
        if (request.getActive() != null) teacher.setActive(request.getActive());
        if (request.getPassword() != null && !request.getPassword().isBlank()) {
            teacher.setPassword(passwordEncoder.encode(request.getPassword()));
        }
        return EntityMapper.toUserResponse(userRepository.save(teacher));
    }

    @Transactional
    public void deleteTeacher(Long id) {
        User teacher = requireTeacher(id);
        periodSlotRepository.findByTeacherIdOrderByDayOfWeekAscPeriodNumberAsc(id).forEach(slot -> {
            mediaFileRepository.deleteByPeriodSlotId(slot.getId());
            periodContentRepository.deleteByPeriodSlotId(slot.getId());
        });
        periodSlotRepository.deleteByTeacherId(id);
        teacherNoteRepository.deleteByTeacherId(id);
        userRepository.delete(teacher);
    }

    public DashboardResponse dashboard() {
        List<User> teachers = userRepository.findByRoleOrderByFullNameAsc(Role.TEACHER);
        long active = teachers.stream().filter(User::isActive).count();
        long periods = periodSlotRepository.count();
        List<UserResponse> performance = teachers.stream()
                .sorted((a, b) -> Double.compare(
                        b.getPerformanceScore() != null ? b.getPerformanceScore() : 0,
                        a.getPerformanceScore() != null ? a.getPerformanceScore() : 0))
                .map(EntityMapper::toUserResponse)
                .toList();
        return DashboardResponse.builder()
                .totalTeachers(teachers.size())
                .activeTeachers(active)
                .totalPeriodsAssigned(periods)
                .teacherPerformance(performance)
                .build();
    }

    public User requireTeacher(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Teacher not found"));
        if (user.getRole() != Role.TEACHER) {
            throw new BadRequestException("User is not a teacher");
        }
        return user;
    }
}
