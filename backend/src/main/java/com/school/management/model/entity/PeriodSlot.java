package com.school.management.model.entity;

import com.school.management.model.enums.DayOfWeek;
import com.school.management.model.enums.PeriodType;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "period_slots", uniqueConstraints = {
        @UniqueConstraint(columnNames = {"teacher_id", "day_of_week", "period_number"})
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PeriodSlot {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(optional = false, fetch = FetchType.LAZY)
    @JoinColumn(name = "teacher_id", nullable = false)
    private User teacher;

    @Enumerated(EnumType.STRING)
    @Column(name = "day_of_week", nullable = false, length = 20)
    private DayOfWeek dayOfWeek;

    /** Period number within the day (1–8). */
    @Column(name = "period_number", nullable = false)
    private Integer periodNumber;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private PeriodType periodType;

    @Column(length = 120)
    private String subject;

    @Column(length = 80)
    private String className;

    @Column(length = 255)
    private String title;
}
