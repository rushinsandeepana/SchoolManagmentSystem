package com.school.management.model.entity;

import com.school.management.model.enums.AttendanceStatus;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(
        name = "teacher_attendance",
        uniqueConstraints = {
                @UniqueConstraint(
                        name = "uk_teacher_attendance_date",
                        columnNames = {
                                "teacher_id",
                                "attendance_date"
                        }
                )
        },
        indexes = {
                @Index(
                        name = "idx_teacher_attendance_date",
                        columnList = "attendance_date"
                ),
                @Index(
                        name = "idx_teacher_attendance_teacher",
                        columnList = "teacher_id"
                ),
                @Index(
                        name = "idx_teacher_attendance_status",
                        columnList = "status"
                )
        }
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TeacherAttendance {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(
            name = "teacher_id",
            nullable = false,
            foreignKey = @ForeignKey(
                    name = "fk_teacher_attendance_teacher"
            )
    )
    private User teacher;

    @Column(
            name = "attendance_date",
            nullable = false
    )
    private LocalDate attendanceDate;

    @Enumerated(EnumType.STRING)
    @Column(
            name = "status",
            nullable = false,
            length = 20
    )
    private AttendanceStatus status;

    @Column(
            name = "remark",
            length = 255
    )
    private String remark;

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
