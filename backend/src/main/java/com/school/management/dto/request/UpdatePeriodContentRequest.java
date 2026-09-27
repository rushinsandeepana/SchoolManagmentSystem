package com.school.management.dto.request;

import lombok.Data;

@Data
public class UpdatePeriodContentRequest {
    private String activityTitle;
    private String activityDescription;
    private String notes;
}
