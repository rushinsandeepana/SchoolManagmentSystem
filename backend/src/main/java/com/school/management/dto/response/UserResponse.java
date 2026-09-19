package com.school.management.dto.response;

import com.school.management.model.enums.Role;
import lombok.Builder;
import lombok.Data;

import java.time.Instant;

@Data
@Builder
public class UserResponse {
    private Long id;
    private String username;
    private String fullName;
    private String email;
    private Role role;
    private boolean active;
    private Double performanceScore;
    private String subject;
    private Instant createdAt;
}
