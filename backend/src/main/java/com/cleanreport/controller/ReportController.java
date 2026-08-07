package com.cleanreport.controller;

import com.cleanreport.dto.request.CreateReportRequest;
import com.cleanreport.dto.response.ApiResponse;
import com.cleanreport.dto.response.DashboardStatsResponse;
import com.cleanreport.dto.response.ReportResponse;
import com.cleanreport.exception.BadRequestException;
import com.cleanreport.model.enums.ReportCategory;
import com.cleanreport.model.enums.ReportStatus;
import com.cleanreport.service.ReportService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.ExampleObject;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import jakarta.validation.Validator;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/reports")
@RequiredArgsConstructor
@Tag(name = "Reports", description = "Submit sanitation issue reports, search, view stats, filter by status/category/location.")
public class ReportController {

    private final ReportService reportService;
    private final Validator validator;

    @Operation(
            summary = "Submit a new report",
            description = """
                    Creates a sanitation issue report. Requires authentication (Bearer token).
                    
                    **Flow:**
                    1. Frontend uploads photo to Cloudinary → gets photoUrl
                    2. Frontend captures GPS coordinates from browser
                    3. User selects category and optionally adds title + description
                    4. Submit this endpoint with all data
                    5. If no address provided, reverse geocoding auto-fills it from coordinates
                    
                    **Credits:** Reporter earns +10 credits on successful submission.
                    
                    **Reference number:** A unique CR-XXXXX number is generated for tracking.
                    
                    **Categories:** OVERFLOW, ILLEGAL_DUMPING, BLOCKED_DRAIN, STREET_LITTER, RESIDENTIAL_DUMP, COMMERCIAL_DUMP
                    
                    **Urgency levels:** ROUTINE (default), VERY_URGENT, CRITICAL
                    """,
            security = @SecurityRequirement(name = "Bearer Auth"))
    @ApiResponses(value = {
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "201", description = "Report created successfully"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "400", description = "Validation error (missing photo, category, or coordinates)"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "401", description = "Not authenticated — include Bearer token in Authorization header")
    })
    @PostMapping
    public ResponseEntity<ApiResponse<ReportResponse>> createReport(
            @Valid @RequestBody CreateReportRequest request,
            Authentication authentication) {
        ReportResponse response = reportService.createReport(request, authentication.getName());
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.created(response, "Report submitted successfully"));
    }

    @Operation(
            summary = "Bulk submit reports (offline sync)",
            description = """
                    Creates several sanitation issue reports in one request. Requires authentication (Bearer token).
                    
                    **Use case:** the mobile/PWA client queued reports while offline and flushes them once
                    connectivity returns.
                    
                    **Transactional:** all-or-nothing — if any report fails, the whole batch is rolled back
                    and no credits are awarded.
                    
                    **Credits:** reporter earns +10 credits per report in the batch.
                    
                    **Body:** a JSON array of the same payload accepted by `POST /reports`.
                    
                    **Validation:** every element is validated individually; the response lists the failing
                    index and field (e.g. `reports[2].photoUrl: Photo URL is required`).
                    """,
            security = @SecurityRequirement(name = "Bearer Auth"))
    @ApiResponses(value = {
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "201", description = "Reports created successfully"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "400", description = "Empty array, or an element failed validation"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "401", description = "Not authenticated — include Bearer token in Authorization header")
    })
    @PostMapping("/bulk")
    public ResponseEntity<ApiResponse<List<ReportResponse>>> createReportsBulk(
            @Valid @RequestBody List<CreateReportRequest> requests,
            Authentication authentication) {
        validateBulk(requests);
        List<ReportResponse> responses = reportService.createReportsBulk(requests, authentication.getName());
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.created(responses, "Bulk reports created successfully"));
    }

    /**
     * Bean Validation does not cascade into collection elements for {@code @Valid @RequestBody List<T>}:
     * {@code @Valid} makes Spring validate the {@code List} instance itself, which declares no constraints,
     * so per-element annotations on {@link CreateReportRequest} would be silently skipped. Validate each
     * element explicitly so a bad payload returns 400 instead of blowing up inside the service.
     */
    private void validateBulk(List<CreateReportRequest> requests) {
        if (requests == null || requests.isEmpty()) {
            throw new BadRequestException("At least one report is required");
        }

        List<String> errors = new ArrayList<>();
        for (int i = 0; i < requests.size(); i++) {
            CreateReportRequest request = requests.get(i);
            if (request == null) {
                errors.add("reports[" + i + "]: must not be null");
                continue;
            }
            final int index = i;
            validator.validate(request).stream()
                    .map(violation -> "reports[" + index + "]." + violation.getPropertyPath() + ": " + violation.getMessage())
                    .sorted()
                    .forEach(errors::add);
        }

        if (!errors.isEmpty()) {
            throw new BadRequestException("Validation failed: " + String.join("; ", errors));
        }
    }

    @Operation(
            summary = "List reports (paginated, filterable)",
            description = """
                    Returns a paginated list of all reports. **Public endpoint — no auth required.**
                    
                    **Filters:**
                    - `status`: REPORTED, ACKNOWLEDGED, IN_PROGRESS, RESOLVED
                    - `category`: OVERFLOW, ILLEGAL_DUMPING, BLOCKED_DRAIN, STREET_LITTER, RESIDENTIAL_DUMP, COMMERCIAL_DUMP
                    
                    **Pagination:**
                    - `page`: 0-based page number (default: 0)
                    - `size`: items per page (default: 20, max: 100)
                    
                    **Sorting:** Always newest first (createdAt DESC).
                    """)
    @GetMapping
    public ResponseEntity<ApiResponse<Page<ReportResponse>>> getReports(
            @Parameter(description = "Filter by status", example = "REPORTED")
            @RequestParam(required = false) ReportStatus status,
            @Parameter(description = "Filter by category", example = "ILLEGAL_DUMPING")
            @RequestParam(required = false) ReportCategory category,
            @Parameter(description = "Page number (0-based)", example = "0")
            @RequestParam(defaultValue = "0") int page,
            @Parameter(description = "Items per page (max 100)", example = "20")
            @RequestParam(defaultValue = "20") int size) {
        Page<ReportResponse> reports = reportService.getReports(status, category,
                PageRequest.of(page, Math.min(size, 100), Sort.by(Sort.Direction.DESC, "createdAt")));
        return ResponseEntity.ok(ApiResponse.ok(reports));
    }

    @Operation(
            summary = "Search reports by keyword",
            description = """
                    Full-text search across report title, description, and address.
                    Uses PostgreSQL's `to_tsvector` for efficient text matching.
                    **Public endpoint — no auth required.**
                    
                    **Example:** `/reports/search?q=drainage&page=0&size=10`
                    """)
    @GetMapping("/search")
    public ResponseEntity<ApiResponse<Page<ReportResponse>>> searchReports(
            @Parameter(description = "Search keyword", required = true, example = "drainage")
            @RequestParam("q") String keyword,
            @Parameter(description = "Page number (0-based)", example = "0")
            @RequestParam(defaultValue = "0") int page,
            @Parameter(description = "Items per page (max 100)", example = "20")
            @RequestParam(defaultValue = "20") int size) {
        Page<ReportResponse> results = reportService.searchReports(keyword,
                PageRequest.of(page, Math.min(size, 100)));
        return ResponseEntity.ok(ApiResponse.ok(results));
    }

    @Operation(
            summary = "Get dashboard statistics",
            description = """
                    Returns aggregated statistics for the dashboard:
                    - Total reports count
                    - Resolved vs pending count
                    - Breakdown by status
                    - Breakdown by category
                    - Total community credits earned
                    - Total registered users
                    
                    **Public endpoint — no auth required.**
                    """)
    @GetMapping("/stats")
    public ResponseEntity<ApiResponse<DashboardStatsResponse>> getDashboardStats() {
        DashboardStatsResponse stats = reportService.getDashboardStats();
        return ResponseEntity.ok(ApiResponse.ok(stats));
    }

    @Operation(
            summary = "Get lightweight map markers for all reports",
            description = """
                    Returns all reports as minimal marker objects — only id, coordinates, status,
                    category, areaName and createdAt. Excludes description, photoUrl and all heavy fields.
                    Designed for rendering 10,000+ map pins without browser lag. **Public endpoint.**
                    """)
    @GetMapping("/map-markers")
    public ResponseEntity<ApiResponse<java.util.List<com.cleanreport.dto.response.MapMarkerResponse>>> getMapMarkers() {
        return ResponseEntity.ok(ApiResponse.ok(reportService.getMapMarkers()));
    }

    @Operation(
            summary = "Get report by ID",
            description = """
                    Returns full details of a single report including reporter name
                    (or "Anonymous" if submitted anonymously), photo URL, GPS coordinates,
                    title, address, status, and timestamps. **Public endpoint.**
                    
                    `upvotesCount` is always returned. `hasUpvoted` reflects the caller's own upvote when a
                    Bearer token is supplied, and is `false` for anonymous callers.
                    """)
    @ApiResponses(value = {
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Report found"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "404", description = "Report not found",
                    content = @Content(examples = @ExampleObject(value = """
                            {"success":false,"message":"Report not found: 550e8400-e29b-41d4-a716-446655440000","errors":null,"timestamp":"2026-07-13T12:00:00Z"}
                            """)))
    })
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<ReportResponse>> getReportById(
            @Parameter(description = "Report UUID", example = "550e8400-e29b-41d4-a716-446655440000")
            @PathVariable UUID id,
            Authentication authentication) {
        // Public endpoint: authentication is null when no Bearer token is supplied.
        ReportResponse response = reportService.getReportById(id,
                authentication != null ? authentication.getName() : null);
        return ResponseEntity.ok(ApiResponse.ok(response));
    }

    @Operation(
            summary = "Toggle upvote on a report",
            description = """
                    Adds the caller's upvote to a report, or removes it if they already upvoted.
                    Requires authentication (Bearer token). Idempotent per call direction — calling twice
                    returns the report to its original state.
                    
                    **Response:** the updated report, where `upvotesCount` is the new total and
                    `hasUpvoted` is the caller's new state (`true` = added, `false` = removed).
                    """,
            security = @SecurityRequirement(name = "Bearer Auth"))
    @ApiResponses(value = {
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Upvote toggled successfully"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "401", description = "Not authenticated — include Bearer token in Authorization header"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "404", description = "Report not found",
                    content = @Content(examples = @ExampleObject(value = """
                            {"success":false,"message":"Report not found: 550e8400-e29b-41d4-a716-446655440000","errors":null,"timestamp":"2026-07-13T12:00:00Z"}
                            """)))
    })
    @PostMapping("/{id}/upvote")
    public ResponseEntity<ApiResponse<ReportResponse>> toggleUpvote(
            @Parameter(description = "Report UUID", example = "550e8400-e29b-41d4-a716-446655440000")
            @PathVariable UUID id,
            Authentication authentication) {
        ReportResponse response = reportService.toggleUpvote(id, authentication.getName());
        return ResponseEntity.ok(ApiResponse.ok(response, "Upvote toggled successfully"));
    }

    @Operation(
            summary = "Find reports near a location",
            description = """
                    Returns all reports within a given radius of GPS coordinates.
                    Uses PostGIS geospatial query. **Public endpoint.**
                    
                    **Example:** `/reports/nearby?lat=6.5244&lng=3.3792&radius=5`
                    → all reports within 5km of Lekki, Lagos.
                    """)
    @GetMapping("/nearby")
    public ResponseEntity<ApiResponse<List<ReportResponse>>> getNearbyReports(
            @Parameter(description = "Latitude of center point", required = true, example = "6.5244")
            @RequestParam double lat,
            @Parameter(description = "Longitude of center point", required = true, example = "3.3792")
            @RequestParam double lng,
            @Parameter(description = "Search radius in kilometers", example = "5")
            @RequestParam(defaultValue = "5") double radius) {
        List<ReportResponse> reports = reportService.getNearbyReports(lat, lng, radius);
        return ResponseEntity.ok(ApiResponse.ok(reports));
    }

    @Operation(
            summary = "Get my reports",
            description = """
                    Returns all reports submitted by the currently authenticated user.
                    Requires Bearer token. Sorted newest first.
                    """,
            security = @SecurityRequirement(name = "Bearer Auth"))
    @ApiResponses(value = {
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "List of user's reports"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "401", description = "Not authenticated")
    })
    @GetMapping("/my")
    public ResponseEntity<ApiResponse<List<ReportResponse>>> getMyReports(Authentication authentication) {
        List<ReportResponse> reports = reportService.getMyReports(authentication.getName());
        return ResponseEntity.ok(ApiResponse.ok(reports));
    }
}
