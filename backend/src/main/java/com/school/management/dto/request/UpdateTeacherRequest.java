package com.school.management.dto.request;

import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class UpdateTeacherRequest {
    @jakarta.validation.constraints.NotBlank(message = "Full name must not be blank")
    @Size(max = 120, message = "Full name must not exceed 120 characters")
    private String fullName;
    @jakarta.validation.constraints.Email(message = "Email must be valid")
    private String email;
    @Size(max = 120, message = "Subject must not exceed 120 characters")
    private String subject;
    @jakarta.validation.constraints.DecimalMin(value = "0.0", message = "Performance score must be at least 0")
    @jakarta.validation.constraints.DecimalMax(value = "100.0", message = "Performance score must not exceed 100")
    private Double performanceScore;
    private Boolean active;
    @Size(min = 4, max = 100, message = "Password must be between 4 and 100 characters")
    private String password;
}
