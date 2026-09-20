package com.school.management.model.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.Instant;

@Entity
@Table(name = "school_classes", uniqueConstraints = @UniqueConstraint(columnNames = {"grade", "section"}))
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SchoolClass {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 30)
    private String grade;

    @Column(nullable = false, length = 10)
    private String section;

    @Column(length = 500)
    private String description;

    @Column
    private Integer capacity;

    @Column(length = 120)
    private String classTeacherName;

    @Column(nullable = false)
    @Builder.Default
    private boolean active = true;

    @Column(nullable = false, updatable = false)
    @Builder.Default
    private Instant createdAt = Instant.now();

    @Column(nullable = false)
    @Builder.Default
    private Instant updatedAt = Instant.now();

    @PreUpdate
    void updateTimestamp() {
        updatedAt = Instant.now();
    }
}
