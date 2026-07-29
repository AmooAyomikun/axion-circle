package com.cleanreport.controller;

import com.cleanreport.dto.response.AnalyticsDashboardResponse;
import com.cleanreport.dto.response.ApiResponse;
import com.cleanreport.service.AnalyticsService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/analytics")
@RequiredArgsConstructor
@Tag(name = "Analytics", description = "Aggregated operational analytics for the admin dashboard. Requires ADMIN role.")
public class AnalyticsController {

    private final AnalyticsService analyticsService;

    @Operation(
            summary = "Analytics dashboard (Admin only)",
            description = """
                    Returns every chart dataset for the admin analytics dashboard in one call:

                    - `trendsLast30Days`: created vs resolved per day for the last 30 days
                      (dense series, missing days filled with zeros, oldest first, UTC)
                    - `byStatus`: report count per status (name/value pairs)
                    - `byDayOfWeek`: report count per weekday, Sunday first (always 7 entries)
                    - `topAreas`: the 10 areas with the most reports
                    - `resolutionByCategory`: resolution rate per category in percent
                      (0-100, one decimal; 0 when a category has no reports)

                    **Requires ADMIN role** — this endpoint exposes aggregate operational data.
                    """,
            security = @SecurityRequirement(name = "Bearer Auth"))
    @ApiResponses(value = {
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Dashboard analytics returned"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "401", description = "Not authenticated"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "403", description = "Not an admin")
    })
    @GetMapping("/dashboard")
    public ResponseEntity<ApiResponse<AnalyticsDashboardResponse>> getDashboard() {
        AnalyticsDashboardResponse dashboard = analyticsService.getDashboard();
        return ResponseEntity.ok(ApiResponse.ok(dashboard));
    }
}
