package com.cleanreport.controller;

import com.cleanreport.dto.request.UpdateStatusRequest;
import com.cleanreport.dto.response.ApiResponse;
import com.cleanreport.dto.response.ReportResponse;
import com.cleanreport.dto.response.StatusHistoryResponse;
import com.cleanreport.model.enums.ReportCategory;
import com.cleanreport.model.enums.ReportStatus;
import com.cleanreport.service.ReportService;
import com.cleanreport.service.StatusService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneOffset;
import java.util.UUID;

@RestController
@RequestMapping("/admin/reports")
@RequiredArgsConstructor
@Tag(name = "Admin", description = "Admin-only endpoints for managing reports. Requires ADMIN role.")
public class AdminController {

    private final ReportService reportService;
    private final StatusService statusService;

    @Operation(
            summary = "List all reports with advanced filters (Admin only)",
            description = """
                    Enhanced report listing for admin dashboard. Supports all public filters
                    plus date range and area filtering, with configurable sort order.
                    
                    **Filters:**
                    - `status`: REPORTED, ACKNOWLEDGED, IN_PROGRESS, RESOLVED
                    - `category`: OVERFLOW, ILLEGAL_DUMPING, BLOCKED_DRAIN, STREET_LITTER, RESIDENTIAL_DUMP, COMMERCIAL_DUMP
                    - `from` / `to`: Date range filter (ISO format: 2026-07-01)
                    - `area`: Filter by area_name (partial match)
                    
                    **Sort:** `sortBy` (createdAt, updatedAt, category, status) + `direction` (asc, desc)
                    
                    **Requires ADMIN role.**
                    """,
            security = @SecurityRequirement(name = "Bearer Auth"))
    @GetMapping
    public ResponseEntity<ApiResponse<Page<ReportResponse>>> getAdminReports(
            @Parameter(description = "Filter by status") @RequestParam(required = false) ReportStatus status,
            @Parameter(description = "Filter by category") @RequestParam(required = false) ReportCategory category,
            @Parameter(description = "From date (inclusive, ISO format)", example = "2026-07-01") @RequestParam(required = false) LocalDate from,
            @Parameter(description = "To date (inclusive, ISO format)", example = "2026-07-31") @RequestParam(required = false) LocalDate to,
            @Parameter(description = "Filter by area name (partial match)") @RequestParam(required = false) String area,
            @Parameter(description = "Sort field", example = "createdAt") @RequestParam(defaultValue = "createdAt") String sortBy,
            @Parameter(description = "Sort direction", example = "desc") @RequestParam(defaultValue = "desc") String direction,
            @Parameter(description = "Page number (0-based)") @RequestParam(defaultValue = "0") int page,
            @Parameter(description = "Items per page (max 100)") @RequestParam(defaultValue = "20") int size) {

        Sort.Direction sortDirection = "asc".equalsIgnoreCase(direction) ? Sort.Direction.ASC : Sort.Direction.DESC;
        String sortField = validateSortField(sortBy);

        Instant fromInstant = from != null ? from.atStartOfDay(ZoneOffset.UTC).toInstant() : null;
        Instant toInstant = to != null ? to.plusDays(1).atStartOfDay(ZoneOffset.UTC).toInstant() : null;

        Page<ReportResponse> reports = reportService.getAdminReports(
                status, category, fromInstant, toInstant, area,
                PageRequest.of(page, Math.min(size, 100), Sort.by(sortDirection, sortField)));

        return ResponseEntity.ok(ApiResponse.ok(reports));
    }

    @Operation(
            summary = "Update report status (Admin only)",
            description = """
                    Alias of `PUT /reports/{id}/status` exposed under the admin namespace so that
                    admin dashboards can keep every management call under `/admin/**`.
                    Behaviour is identical — same validation, same status history record,
                    same credit awards.

                    Only forward transitions are allowed:
                    REPORTED → ACKNOWLEDGED → IN_PROGRESS → RESOLVED.
                    Attempting to go backward returns 400.

                    **Requires ADMIN role.**
                    """,
            security = @SecurityRequirement(name = "Bearer Auth"))
    @ApiResponses(value = {
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Status updated successfully"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "400", description = "Invalid transition (backward) or validation error"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "401", description = "Not authenticated"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "403", description = "Not an admin"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "404", description = "Report not found")
    })
    @PatchMapping("/{id}/status")
    public ResponseEntity<ApiResponse<StatusHistoryResponse>> updateReportStatus(
            @Parameter(description = "Report UUID") @PathVariable UUID id,
            @Valid @RequestBody UpdateStatusRequest request,
            Authentication authentication) {
        StatusHistoryResponse response = statusService.updateStatus(id, request, authentication.getName());
        return ResponseEntity.ok(ApiResponse.ok(response));
    }

    private String validateSortField(String sortBy) {
        return switch (sortBy.toLowerCase()) {
            case "createdat", "created_at", "created" -> "createdAt";
            case "updatedat", "updated_at", "updated" -> "updatedAt";
            case "category" -> "category";
            case "status" -> "status";
            case "urgency" -> "urgency";
            default -> "createdAt";
        };
    }
}
