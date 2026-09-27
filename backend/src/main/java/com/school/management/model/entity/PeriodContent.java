package com.school.management.model.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.Instant;
import java.time.LocalDateTime;

import org.hibernate.annotations.CreationTimestamp;

@Entity
@Table(name = "period_contents")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PeriodContent {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "period_slot_id", nullable = false)
    private PeriodSlot periodSlot;

    @Column(length = 200)
    private String activityTitle;

    @Column(columnDefinition = "TEXT")
    private String activityDescription;

    @Column(columnDefinition = "TEXT")
    private String notes;

    @CreationTimestamp
    private LocalDateTime createdAt;

    @Column(nullable = false)
    @Builder.Default
    private Instant updatedAt = Instant.now();
}
