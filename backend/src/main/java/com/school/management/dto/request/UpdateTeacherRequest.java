package com.school.management.dto.request;

import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class UpdateTeacherRequest {
    @Size(max = 120)
    private String fullName;
    private String email;
    private String subject;
    private Double performanceScore;
    private Boolean active;
    private String password;
}
