package com.cleanreport.controller;

import com.cleanreport.dto.request.ChangePasswordRequest;
import com.cleanreport.dto.request.UpdateNotificationPreferencesRequest;
import com.cleanreport.dto.request.UpdateProfileRequest;
import com.cleanreport.dto.response.ApiResponse;
import com.cleanreport.dto.response.CreditBalanceResponse;
import com.cleanreport.dto.response.NotificationPreferencesResponse;
import com.cleanreport.dto.response.UserResponse;
import com.cleanreport.service.CreditService;
import com.cleanreport.service.UserService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/users")
@RequiredArgsConstructor
@Tag(name = "Users", description = "User profile management")
public class UserController {

    private final UserService userService;
    private final CreditService creditService;

    @Operation(summary = "Get my profile", security = @SecurityRequirement(name = "Bearer Auth"))
    @GetMapping("/me")
    public ResponseEntity<ApiResponse<UserResponse>> getMyProfile(Authentication authentication) {
        return ResponseEntity.ok(ApiResponse.ok(userService.getProfile(authentication.getName())));
    }

    @Operation(summary = "Update my profile (display name, avatar, name, phone, gender, address)",
               security = @SecurityRequirement(name = "Bearer Auth"))
    @PatchMapping("/me")
    public ResponseEntity<ApiResponse<UserResponse>> updateProfile(
            @Valid @RequestBody UpdateProfileRequest request,
            Authentication authentication) {
        UserResponse response = userService.updateProfile(request, authentication.getName());
        return ResponseEntity.ok(ApiResponse.ok(response, "Profile updated successfully"));
    }

    @Operation(summary = "Get my notification preferences", security = @SecurityRequirement(name = "Bearer Auth"))
    @GetMapping("/me/preferences")
    public ResponseEntity<ApiResponse<NotificationPreferencesResponse>> getPreferences(Authentication authentication) {
        return ResponseEntity.ok(ApiResponse.ok(userService.getPreferences(authentication.getName())));
    }

    @Operation(summary = "Update my notification preferences", security = @SecurityRequirement(name = "Bearer Auth"))
    @PatchMapping("/me/preferences")
    public ResponseEntity<ApiResponse<NotificationPreferencesResponse>> updatePreferences(
            @Valid @RequestBody UpdateNotificationPreferencesRequest request,
            Authentication authentication) {
        NotificationPreferencesResponse response = userService.updatePreferences(request, authentication.getName());
        return ResponseEntity.ok(ApiResponse.ok(response, "Preferences updated successfully"));
    }

    @Operation(summary = "Change my password", security = @SecurityRequirement(name = "Bearer Auth"))
    @PostMapping("/me/password")
    public ResponseEntity<ApiResponse<Void>> changePassword(
            @Valid @RequestBody ChangePasswordRequest request,
            Authentication authentication) {
        userService.changePassword(request, authentication.getName());
        return ResponseEntity.ok(ApiResponse.ok(null, "Password changed successfully"));
    }

    @Operation(
            summary = "Get my points balance (alias for GET /credits/balance)",
            description = "Alias endpoint matching frontend convention. Same data as GET /credits/balance.",
            security = @SecurityRequirement(name = "Bearer Auth"))
    @GetMapping("/me/points")
    public ResponseEntity<ApiResponse<CreditBalanceResponse>> getMyPoints(Authentication authentication) {
        return ResponseEntity.ok(ApiResponse.ok(creditService.getBalance(authentication.getName())));
    }
}
