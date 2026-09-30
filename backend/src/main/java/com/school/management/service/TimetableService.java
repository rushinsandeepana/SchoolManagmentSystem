package com.school.management.service;

import com.school.management.dto.request.TimetableRequest;
import com.school.management.dto.response.TimetableResponse;
import com.school.management.exception.BadRequestException;
import com.school.management.exception.ResourceNotFoundException;
import com.school.management.model.entity.SchoolClass;
import com.school.management.model.entity.Subject;
import com.school.management.model.entity.Timetable;
import com.school.management.model.entity.User;
import com.school.management.model.enums.Role;
import com.school.management.repository.SchoolClassRepository;
import com.school.management.repository.SubjectRepository;
import com.school.management.repository.TimetableRepository;
import com.school.management.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class TimetableService {

    private final TimetableRepository timetableRepository;
    private final UserRepository userRepository;
    private final SubjectRepository subjectRepository;
    private final SchoolClassRepository schoolClassRepository;

    // =========================================================
    // CREATE
    // =========================================================

    @Transactional
    public TimetableResponse create(TimetableRequest request) {

        String day = normalizeDay(request.getDay());

        validatePeriod(request.getPeriod());

        User teacher = getTeacher(request.getTeacherId());
        Subject subject = getSubject(request.getSubjectId());
        SchoolClass schoolClass = getSchoolClass(request.getClassId());

        // =========================================================
        // VALIDATE TIMETABLE
        // =========================================================

        validateTimetable(
                teacher,
                subject,
                schoolClass,
                day,
                request.getPeriod(),
                null
        );

        // =========================================================
        // CREATE
        // =========================================================

        Timetable timetable = Timetable.builder()
                .teacher(teacher)
                .subject(subject)
                .schoolClass(schoolClass)
                .day(day)
                .period(request.getPeriod())
                .build();

        return toResponse(
                timetableRepository.save(timetable)
        );
    }

    // =========================================================
    // GET ALL / FILTER
    // =========================================================

    @Transactional(readOnly = true)
    public List<TimetableResponse> getAll(
            Long teacherId,
            Long classId,
            Long subjectId,
            LocalDateTime createdAt
    ) {

        List<Timetable> timetables;

        if (teacherId != null && classId != null && subjectId != null) {

            timetables =
                    timetableRepository
                            .findByTeacherIdAndSchoolClassIdAndSubjectIdAndCreatedAt(
                                    teacherId,
                                    classId,
                                    subjectId,
                                    createdAt
                            );

        } else if (teacherId != null && classId != null) {

            timetables =
                    timetableRepository
                            .findByTeacherIdAndSchoolClassId(
                                    teacherId,
                                    classId
                            );

        } else if (teacherId != null && subjectId != null) {

            timetables =
                    timetableRepository
                            .findByTeacherIdAndSubjectId(
                                    teacherId,
                                    subjectId
                            );

        } else if (classId != null && subjectId != null) {

            timetables =
                    timetableRepository
                            .findBySchoolClassIdAndSubjectId(
                                    classId,
                                    subjectId
                            );

        } else if (teacherId != null) {

            timetables =
                    timetableRepository.findByTeacherId(teacherId);

        } else if (classId != null) {

            timetables =
                    timetableRepository.findBySchoolClassId(classId);

        } else if (subjectId != null) {

            timetables =
                    timetableRepository.findBySubjectId(subjectId);

        } else {

            timetables = timetableRepository.findAll();
        }

        return timetables.stream()
                .map(this::toResponse)
                .toList();
    }

    // =========================================================
    // GET BY ID
    // =========================================================

    @Transactional(readOnly = true)
    public TimetableResponse getById(Long id) {

        return toResponse(findTimetable(id));
    }

    // =========================================================
    // PATCH / UPDATE
    // =========================================================

    @Transactional
    public TimetableResponse update(
        Long id,
        TimetableRequest request
    ) {

        Timetable timetable = findTimetable(id);

        // =========================================================
        // GET FINAL VALUES
        // =========================================================

        User teacher = timetable.getTeacher();

        if (request.getTeacherId() != null) {
                teacher = getTeacher(request.getTeacherId());
        }

        Subject subject = timetable.getSubject();

        if (request.getSubjectId() != null) {
                subject = getSubject(request.getSubjectId());
        }

        SchoolClass schoolClass = timetable.getSchoolClass();

        if (request.getClassId() != null) {
                schoolClass = getSchoolClass(request.getClassId());
        }

        String day = timetable.getDay();

        if (request.getDay() != null) {
                day = normalizeDay(request.getDay());
        }

        Integer period = timetable.getPeriod();

        if (request.getPeriod() != null) {
                period = request.getPeriod();
        }

        validatePeriod(period);

        // =========================================================
        // VALIDATE FINAL TIMETABLE
        //
        // Exclude the current timetable ID because we are
        // updating this existing record.
        // =========================================================

        validateTimetable(
                teacher,
                subject,
                schoolClass,
                day,
                period,
                id
        );

        // =========================================================
        // UPDATE
        // =========================================================

        timetable.setTeacher(teacher);
        timetable.setSubject(subject);
        timetable.setSchoolClass(schoolClass);
        timetable.setDay(day);
        timetable.setPeriod(period);

        return toResponse(
                timetableRepository.save(timetable)
        );
    }

    // =========================================================
    // DELETE ONE TIMETABLE SLOT
    // =========================================================

    @Transactional
    public void delete(Long id) {

        Timetable timetable = findTimetable(id);

        timetableRepository.delete(timetable);
    }

    // =========================================================
    // DELETE ALL TIMETABLES FOR TEACHER
    // =========================================================

    @Transactional
    public void deleteByTeacher(Long teacherId) {

        getTeacher(teacherId);

        timetableRepository.deleteByTeacherId(teacherId);
    }

    // =========================================================
    // DELETE TEACHER + SUBJECT GROUP
    // =========================================================

    @Transactional
    public void deleteByTeacherAndSubject(
            Long teacherId,
            Long subjectId
    ) {

        getTeacher(teacherId);
        getSubject(subjectId);

        timetableRepository.deleteByTeacherIdAndSubjectId(
                teacherId,
                subjectId
        );
    }

    // =========================================================
    // FIND TIMETABLE
    // =========================================================

    private Timetable findTimetable(Long id) {

        return timetableRepository.findById(id)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Timetable not found"
                        )
                );
    }

    // =========================================================
    // FIND TEACHER
    // =========================================================

    private User getTeacher(Long id) {

        User teacher = userRepository.findById(id)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Teacher not found"
                        )
                );

        if (teacher.getRole() != Role.TEACHER) {
            throw new BadRequestException(
                    "User is not a teacher"
            );
        }

        return teacher;
    }

    // =========================================================
    // FIND SUBJECT
    // =========================================================

    private Subject getSubject(Long id) {

        return subjectRepository.findById(id)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Subject not found"
                        )
                );
    }

    // =========================================================
    // FIND CLASS
    // =========================================================

    private SchoolClass getSchoolClass(Long id) {

        return schoolClassRepository.findById(id)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Class not found"
                        )
                );
    }

    // =========================================================
    // TEACHER CONFLICT VALIDATION
    // =========================================================

//     private void validateTeacherConflict(
//             Long teacherId,
//             String day,
//             Integer period,
//             Long timetableId
//     ) {

//         boolean exists;

//         if (timetableId == null) {

//             exists =
//                     timetableRepository
//                             .existsByTeacherIdAndDayAndPeriod(
//                                     teacherId,
//                                     day,
//                                     period
//                             );

//         } else {

//             exists =
//                     timetableRepository
//                             .existsByTeacherIdAndDayAndPeriodAndIdNot(
//                                     teacherId,
//                                     day,
//                                     period,
//                                     timetableId
//                             );
//         }

//         if (exists) {

//             throw new BadRequestException(
//                     "This teacher already has a timetable assigned for "
//                             + day
//                             + " period "
//                             + period
//             );
//         }
//     }

    // =========================================================
    // CLASS CONFLICT VALIDATION
    // =========================================================

//     private void validateClassConflict(
//             Long classId,
//             String day,
//             Integer period,
//             Long timetableId
//     ) {

//         boolean exists;

//         if (timetableId == null) {

//             exists =
//                     timetableRepository
//                             .existsBySchoolClassIdAndDayAndPeriod(
//                                     classId,
//                                     day,
//                                     period
//                             );

//         } else {

//             exists =
//                     timetableRepository
//                             .existsBySchoolClassIdAndDayAndPeriodAndIdNot(
//                                     classId,
//                                     day,
//                                     period,
//                                     timetableId
//                             );
//         }

//         if (exists) {

//             throw new BadRequestException(
//                     "This class already has a timetable assigned for "
//                             + day
//                             + " period "
//                             + period
//             );
//         }
//     }

    // =========================================================
    // PERIOD VALIDATION
    // =========================================================

    private void validatePeriod(Integer period) {

        if (period == null || period < 1 || period > 8) {

            throw new BadRequestException(
                    "Period must be between 1 and 8"
            );
        }
    }

    // =========================================================
    // DAY NORMALIZATION
    // =========================================================

    private String normalizeDay(String day) {

        if (day == null || day.isBlank()) {

            throw new BadRequestException(
                    "Day is required"
            );
        }

        return day.trim().toUpperCase();
    }

    // =========================================================
    // ENTITY -> RESPONSE
    // =========================================================

    private TimetableResponse toResponse(
            Timetable timetable
    ) {

        SchoolClass schoolClass =
                timetable.getSchoolClass();

        String className =
                schoolClass.getGrade()
                        + schoolClass.getSection();

        return TimetableResponse.builder()
                .id(timetable.getId())

                .teacherId(
                        timetable.getTeacher().getId()
                )
                .teacherName(
                        timetable.getTeacher().getFullName()
                )

                .subjectId(
                        timetable.getSubject().getId()
                )
                .subjectName(
                        timetable.getSubject().getSubjectName()
                )

                .classId(
                        schoolClass.getId()
                )
                .className(className)

                .day(timetable.getDay())
                .period(timetable.getPeriod())
                .createdAt(timetable.getCreatedAt())
                .build();
    }

    private void validateTimetable(
        User teacher,
        Subject subject,
        SchoolClass schoolClass,
        String day,
        Integer period,
        Long timetableId
    ) {

        String teacherName = teacher.getFullName();

        String subjectName = subject.getSubjectName();

        String className =
                schoolClass.getGrade()
                        + schoolClass.getSection();

        // =========================================================
        // 1. EXACT DUPLICATE
        // =========================================================

        boolean duplicate;

        if (timetableId == null) {

                duplicate =
                        timetableRepository
                                .existsByTeacherIdAndSubjectIdAndSchoolClassIdAndDayAndPeriod(
                                        teacher.getId(),
                                        subject.getId(),
                                        schoolClass.getId(),
                                        day,
                                        period
                                );

        } else {

                duplicate =
                        timetableRepository
                                .existsByTeacherIdAndSubjectIdAndSchoolClassIdAndDayAndPeriodAndIdNot(
                                        teacher.getId(),
                                        subject.getId(),
                                        schoolClass.getId(),
                                        day,
                                        period,
                                        timetableId
                                );
        }

        if (duplicate) {

                throw new BadRequestException(
                        "Timetable already exists: Teacher \""
                                + teacherName
                                + "\" is assigned to \""
                                + subjectName
                                + "\" for Class "
                                + className
                                + " on "
                                + day
                                + ", Period "
                                + period
                );
        }

        // =========================================================
        // 2. TEACHER CONFLICT
        // =========================================================

        Optional<Timetable> teacherConflict =
                timetableRepository.findByTeacherIdAndDayAndPeriod(
                        teacher.getId(),
                        day,
                        period
                );

        if (teacherConflict.isPresent()
                && !teacherConflict.get().getId().equals(timetableId)) {

                Timetable existing = teacherConflict.get();

                String existingClass =
                        existing.getSchoolClass().getGrade()
                                + existing.getSchoolClass().getSection();

                throw new BadRequestException(
                        "Teacher \""
                                + teacherName
                                + "\" is already assigned to \""
                                + existing.getSubject().getSubjectName()
                                + "\" for Class "
                                + existingClass
                                + " on "
                                + day
                                + ", Period "
                                + period
                );
        }

        // =========================================================
        // 3. CLASS CONFLICT
        // =========================================================

        Optional<Timetable> classConflict =
                timetableRepository.findBySchoolClassIdAndDayAndPeriod(
                        schoolClass.getId(),
                        day,
                        period
                );

        if (classConflict.isPresent()
                && !classConflict.get().getId().equals(timetableId)) {

                Timetable existing = classConflict.get();

                throw new BadRequestException(
                        "Class "
                                + className
                                + " already has \""
                                + existing.getSubject().getSubjectName()
                                + "\" with Teacher \""
                                + existing.getTeacher().getFullName()
                                + "\" on "
                                + day
                                + ", Period "
                                + period
                );
        }
    }
}