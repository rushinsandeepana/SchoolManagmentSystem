package com.school.management.model.entity;

import com.school.management.model.enums.SubjectType;
import jakarta.persistence.*;
import lombok.*;

import java.time.Instant;

@Entity
@Table(name = "subjects", uniqueConstraints = @UniqueConstraint(columnNames = "subject_code"))
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Subject {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 120)
    private String subjectName;

    @Column(name = "subject_code", nullable = false, length = 30)
    private String subjectCode;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private SubjectType subjectType;

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
