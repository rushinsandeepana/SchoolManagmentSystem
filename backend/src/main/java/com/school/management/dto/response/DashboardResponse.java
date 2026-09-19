package com.school.management.dto.response;

import lombok.Builder;
import lombok.Data;

import java.util.List;

@Data
@Builder
public class DashboardResponse {
    private long totalTeachers;
    private long activeTeachers;
    private long totalPeriodsAssigned;
    private List<UserResponse> teacherPerformance;
}
