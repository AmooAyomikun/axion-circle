package com.cleanreport.controller;

import com.cleanreport.dto.response.AnalyticsDashboardResponse;
import com.cleanreport.dto.response.ApiResponse;
import com.cleanreport.dto.response.TopContributorResponse;
import com.cleanreport.service.AnalyticsService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/analytics")
@RequiredArgsConstructor
@Tag(name = "Analytics", description = "Aggregated analytics for the admin dashboard. Requires ADMIN role.")
public class AnalyticsController {

    private final AnalyticsService analyticsService;

    @Operation(
            summary = "Analytics dashboard (Admin only)",
            description = "Returns all chart datasets in one call: trendsLast30Days, byStatus, byDayOfWeek, topAreas, resolutionByCategory.",
            security = @SecurityRequirement(name = "Bearer Auth"))
    @GetMapping("/dashboard")
    public ResponseEntity<ApiResponse<AnalyticsDashboardResponse>> getDashboard() {
        return ResponseEntity.ok(ApiResponse.ok(analyticsService.getDashboard()));
    }

    @Operation(
            summary = "Top contributors by credit balance (Admin only)",
            description = "Returns top N users ranked by CleanCredits balance. Default limit: 10, max: 50.",
            security = @SecurityRequirement(name = "Bearer Auth"))
    @GetMapping("/top-contributors")
    public ResponseEntity<ApiResponse<List<TopContributorResponse>>> getTopContributors(
            @RequestParam(defaultValue = "10") int limit) {
        return ResponseEntity.ok(ApiResponse.ok(analyticsService.getTopContributors(limit)));
    }
}
