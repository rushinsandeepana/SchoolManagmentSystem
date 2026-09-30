package com.school.management.model.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Entity
@Table(
        name = "timetables",

        uniqueConstraints = {
                @UniqueConstraint(
                        name = "uk_timetable_teacher_day_period",
                        columnNames = {
                                "teacher_id",
                                "day",
                                "period"
                        }
                ),
                @UniqueConstraint(
                        name = "uk_timetable_class_day_period",
                        columnNames = {
                                "class_id",
                                "day",
                                "period"
                        }
                )
        },

        indexes = {
                @Index(
                        name = "idx_timetable_teacher",
                        columnList = "teacher_id"
                ),
                @Index(
                        name = "idx_timetable_subject",
                        columnList = "subject_id"
                ),
                @Index(
                        name = "idx_timetable_class",
                        columnList = "class_id"
                )
        }
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Timetable {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /**
     * Teacher assigned to this timetable slot.
     */
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(
            name = "teacher_id",
            nullable = false,
            foreignKey = @ForeignKey(
                    name = "fk_timetable_teacher"
            )
    )
    private User teacher;

    /**
     * Subject taught during this timetable slot.
     */
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(
            name = "subject_id",
            nullable = false,
            foreignKey = @ForeignKey(
                    name = "fk_timetable_subject"
            )
    )
    private Subject subject;

    /**
     * Class assigned to this timetable slot.
     *
     * A class represents grade + section.
     *
     * Examples:
     * 1A
     * 3C
     * 10F
     */
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(
            name = "class_id",
            nullable = false,
            foreignKey = @ForeignKey(
                    name = "fk_timetable_class"
            )
    )
    private SchoolClass schoolClass;

    /**
     * Day of the week.
     *
     * Example:
     * MONDAY
     * TUESDAY
     * WEDNESDAY
     */
    @Column(
            name = "day",
            nullable = false,
            length = 20
    )
    private String day;

    /**
     * Period number.
     *
     * Example:
     * 1 = P1
     * 2 = P2
     * ...
     * 8 = P8
     */
    @Column(
            name = "period",
            nullable = false
    )
    private Integer period;

    @Column(
            name = "created_at",
            nullable = false,
            updatable = false
    )
    private LocalDateTime createdAt;

    @Column(
            name = "updated_at",
            nullable = false
    )
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        LocalDateTime now = LocalDateTime.now();

        createdAt = now;
        updatedAt = now;
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}