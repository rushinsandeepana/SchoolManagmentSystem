package com.school.management.controller;

import com.school.management.dto.request.ChangePasswordRequest;
import com.school.management.dto.request.LoginRequest;
import com.school.management.dto.response.ApiMessage;
import com.school.management.dto.response.AuthResponse;
import com.school.management.dto.response.UserResponse;
import com.school.management.security.UserPrincipal;
import com.school.management.service.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @PostMapping("/login")
    public AuthResponse login(@Valid @RequestBody LoginRequest request) {
        return authService.login(request);
    }

    @GetMapping("/me")
    public UserResponse me(@AuthenticationPrincipal UserPrincipal principal) {
        return authService.me(principal.getId());
    }

    @PostMapping("/change-password")
    public ApiMessage changePassword(
            @AuthenticationPrincipal UserPrincipal principal,
            @Valid @RequestBody ChangePasswordRequest request) {
        authService.changePassword(principal.getId(), request);
        return new ApiMessage("Password changed successfully");
    }
}
