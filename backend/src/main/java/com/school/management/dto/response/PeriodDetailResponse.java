package com.school.management.dto.response;

import lombok.Builder;
import lombok.Data;

import java.time.Instant;
import java.util.List;

@Data
@Builder
public class PeriodDetailResponse {
    private PeriodSlotResponse slot;
    private String activityTitle;
    private String activityDescription;
    private String notes;
    private Instant updatedAt;
    private List<MediaFileResponse> files;
}
