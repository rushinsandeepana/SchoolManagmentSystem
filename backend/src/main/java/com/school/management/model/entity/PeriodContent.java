package com.school.management.model.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.Instant;

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

    @OneToOne(optional = false, fetch = FetchType.LAZY)
    @JoinColumn(name = "period_slot_id", nullable = false, unique = true)
    private PeriodSlot periodSlot;

    @Column(length = 200)
    private String activityTitle;

    @Column(columnDefinition = "TEXT")
    private String activityDescription;

    @Column(columnDefinition = "TEXT")
    private String notes;

    @Column(nullable = false)
    @Builder.Default
    private Instant updatedAt = Instant.now();
}
