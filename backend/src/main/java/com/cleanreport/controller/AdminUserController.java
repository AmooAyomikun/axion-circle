package com.cleanreport.controller;

import com.cleanreport.dto.request.SuspendUserRequest;
import com.cleanreport.dto.request.UpdateUserRoleRequest;
import com.cleanreport.dto.response.AdminUserResponse;
import com.cleanreport.dto.response.ApiResponse;
import com.cleanreport.model.enums.UserRole;
import com.cleanreport.service.AdminUserService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
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
@Tag(name = "Admin - Users", description = "Admin user management. Requires ADMIN role.")
public class AdminUserController {

    private final AdminUserService adminUserService;

    @Operation(
            summary = "List all users (Admin only)",
            description = """
                    Returns paginated list of users.

                    **Filters:**
                    - `role`: ADMIN or REPORTER
                    - `search`: partial match on name or email
                    - `inactiveOnly=true`: users who haven't logged in for 30+ days (or never)
                    - `includeDeleted=true`: include soft-deleted users (shown with deleted=true)
                    """,
            security = @SecurityRequirement(name = "Bearer Auth"))
    @GetMapping
    public ResponseEntity<ApiResponse<Page<AdminUserResponse>>> listUsers(
            @RequestParam(required = false) UserRole role,
            @RequestParam(required = false) String search,
            @Parameter(description = "Show only inactive users (no login in 30+ days)")
            @RequestParam(defaultValue = "false") boolean inactiveOnly,
            @Parameter(description = "Include soft-deleted users in results")
            @RequestParam(defaultValue = "false") boolean includeDeleted,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {

        Page<AdminUserResponse> users = adminUserService.listUsers(
                role, search, includeDeleted, inactiveOnly,
                PageRequest.of(page, Math.min(size, 100), Sort.by(Sort.Direction.DESC, "createdAt")));
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

    @Operation(
            summary = "Soft delete a user (Admin only)",
            description = "Marks user as deleted (sets deleted_at timestamp). User can no longer log in. Reversible via POST /{id}/restore.",
            security = @SecurityRequirement(name = "Bearer Auth"))
    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<AdminUserResponse>> delete(@PathVariable UUID id) {
        return ResponseEntity.ok(ApiResponse.ok(adminUserService.softDelete(id), "User deleted"));
    }

    @Operation(
            summary = "Restore a soft-deleted user (Admin only)",
            description = "Clears the deleted_at flag, re-enabling the user's account.",
            security = @SecurityRequirement(name = "Bearer Auth"))
    @PostMapping("/{id}/restore")
    public ResponseEntity<ApiResponse<AdminUserResponse>> restore(@PathVariable UUID id) {
        return ResponseEntity.ok(ApiResponse.ok(adminUserService.restore(id), "User restored"));
    }
}
