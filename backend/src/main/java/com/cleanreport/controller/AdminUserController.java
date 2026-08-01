package com.cleanreport.controller;

import com.cleanreport.dto.request.SuspendUserRequest;
import com.cleanreport.dto.request.UpdateUserRoleRequest;
import com.cleanreport.dto.response.AdminUserResponse;
import com.cleanreport.dto.response.ApiResponse;
import com.cleanreport.model.enums.UserRole;
import com.cleanreport.service.AdminUserService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/admin/users")
@RequiredArgsConstructor
@Tag(name = "Admin - Users", description = "Admin user management endpoints. Requires ADMIN role.")
public class AdminUserController {

    private final AdminUserService adminUserService;

    @Operation(summary = "List all users (Admin only)", security = @SecurityRequirement(name = "Bearer Auth"))
    @GetMapping
    public ResponseEntity<ApiResponse<Page<AdminUserResponse>>> listUsers(
            @RequestParam(required = false) UserRole role,
            @RequestParam(required = false) String search,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "desc") String direction) {

        Sort.Direction sortDir = "asc".equalsIgnoreCase(direction) ? Sort.Direction.ASC : Sort.Direction.DESC;
        Page<AdminUserResponse> users = adminUserService.listUsers(
                role, search, PageRequest.of(page, Math.min(size, 100), Sort.by(sortDir, sortBy)));
        return ResponseEntity.ok(ApiResponse.ok(users));
    }

    @Operation(summary = "Get user details (Admin only)", security = @SecurityRequirement(name = "Bearer Auth"))
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<AdminUserResponse>> getUser(@PathVariable UUID id) {
        return ResponseEntity.ok(ApiResponse.ok(adminUserService.getUser(id)));
    }

    @Operation(summary = "Update user role (Admin only)", security = @SecurityRequirement(name = "Bearer Auth"))
    @PatchMapping("/{id}/role")
    public ResponseEntity<ApiResponse<AdminUserResponse>> updateRole(
            @PathVariable UUID id,
            @Valid @RequestBody UpdateUserRoleRequest request) {
        return ResponseEntity.ok(ApiResponse.ok(adminUserService.updateRole(id, request), "Role updated successfully"));
    }

    @Operation(summary = "Suspend or unsuspend a user (Admin only)", security = @SecurityRequirement(name = "Bearer Auth"))
    @PatchMapping("/{id}/suspend")
    public ResponseEntity<ApiResponse<AdminUserResponse>> suspend(
            @PathVariable UUID id,
            @Valid @RequestBody SuspendUserRequest request) {
        String msg = Boolean.TRUE.equals(request.getSuspended()) ? "User suspended" : "User unsuspended";
        return ResponseEntity.ok(ApiResponse.ok(adminUserService.updateSuspension(id, request), msg));
    }
}
