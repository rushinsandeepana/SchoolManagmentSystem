package com.school.management.dto.response;

import lombok.Builder;
import lombok.Data;

import java.util.List;

@Data
@Builder
public class PeriodDetailResponse {

    private PeriodSlotResponse slot;

    private List<PeriodContentResponse> contents;

    private List<MediaFileResponse> files;
}