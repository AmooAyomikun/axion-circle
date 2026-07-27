package com.cleanreport.controller;

import com.cleanreport.dto.request.UpdateProfileRequest;
import com.cleanreport.dto.response.ApiResponse;
import com.cleanreport.dto.response.UserResponse;
import com.cleanreport.exception.ResourceNotFoundException;
import com.cleanreport.model.entity.User;
import com.cleanreport.repository.UserRepository;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/users")
@RequiredArgsConstructor
@Tag(name = "Users", description = "User profile management")
public class UserController {

    private final UserRepository userRepository;

    @Operation(summary = "Get my profile", security = @SecurityRequirement(name = "Bearer Auth"))
    @GetMapping("/me")
    public ResponseEntity<ApiResponse<UserResponse>> getMyProfile(Authentication authentication) {
        User user = userRepository.findByEmail(authentication.getName())
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        return ResponseEntity.ok(ApiResponse.ok(mapToResponse(user)));
    }

    @Operation(summary = "Update my profile (display name + avatar)", 
               security = @SecurityRequirement(name = "Bearer Auth"))
    @Transactional
    @PatchMapping("/me")
    public ResponseEntity<ApiResponse<UserResponse>> updateProfile(
            @Valid @RequestBody UpdateProfileRequest request,
            Authentication authentication) {
        User user = userRepository.findByEmail(authentication.getName())
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        if (request.getDisplayName() != null && !request.getDisplayName().isBlank()) {
            user.setDisplayName(request.getDisplayName().trim());
        }
        if (request.getAvatarUrl() != null && !request.getAvatarUrl().isBlank()) {
            user.setAvatarUrl(request.getAvatarUrl());
        }

        userRepository.save(user);
        return ResponseEntity.ok(ApiResponse.ok(mapToResponse(user), "Profile updated successfully"));
    }

    private UserResponse mapToResponse(User user) {
        return UserResponse.builder()
                .id(user.getId())
                .email(user.getEmail())
                .displayName(user.getDisplayName())
                .role(user.getRole())
                .creditBalance(user.getCreditBalance())
                .build();
    }
}
