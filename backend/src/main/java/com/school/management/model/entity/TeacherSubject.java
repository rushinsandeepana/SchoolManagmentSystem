package com.school.management.model.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(
        name = "teacher_subjects",
        uniqueConstraints = {
                @UniqueConstraint(
                        name = "uk_teacher_subject",
                        columnNames = {"teacher_id", "subject_id"}
                )
        },
        indexes = {
                @Index(
                        name = "idx_teacher_subjects_teacher_id",
                        columnList = "teacher_id"
                ),
                @Index(
                        name = "idx_teacher_subjects_subject_id",
                        columnList = "subject_id"
                )
        }
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TeacherSubject {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(
            name = "teacher_id",
            nullable = false
    )
    private User teacher;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(
            name = "subject_id",
            nullable = false
    )
    private Subject subject;
}