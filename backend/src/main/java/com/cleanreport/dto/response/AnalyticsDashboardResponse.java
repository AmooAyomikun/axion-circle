package com.cleanreport.dto.response;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Collections;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "Aggregated analytics for the admin dashboard")
public class AnalyticsDashboardResponse {

    @Schema(description = "Created vs resolved counts for each of the last 30 days (oldest first, gaps filled with zeros)")
    private List<DailyTrendPoint> trendsLast30Days;

    @Schema(description = "Report counts per status")
    private List<StatusCount> byStatus;

    @Schema(description = "Report counts per weekday, Sunday first")
    private List<DayOfWeekCount> byDayOfWeek;

    @Schema(description = "Areas with the most reports (top 10)")
    private List<AreaCount> topAreas;

    @Schema(description = "Resolution rate per category, in percent")
    private List<CategoryResolutionRate> resolutionByCategory;

    /**
     * Returns unmodifiable view to prevent external mutation.
     */
    public List<DailyTrendPoint> getTrendsLast30Days() {
        return trendsLast30Days != null ? Collections.unmodifiableList(trendsLast30Days) : null;
    }

    /**
     * Returns unmodifiable view to prevent external mutation.
     */
    public List<StatusCount> getByStatus() {
        return byStatus != null ? Collections.unmodifiableList(byStatus) : null;
    }

    /**
     * Returns unmodifiable view to prevent external mutation.
     */
    public List<DayOfWeekCount> getByDayOfWeek() {
        return byDayOfWeek != null ? Collections.unmodifiableList(byDayOfWeek) : null;
    }

    /**
     * Returns unmodifiable view to prevent external mutation.
     */
    public List<AreaCount> getTopAreas() {
        return topAreas != null ? Collections.unmodifiableList(topAreas) : null;
    }

    /**
     * Returns unmodifiable view to prevent external mutation.
     */
    public List<CategoryResolutionRate> getResolutionByCategory() {
        return resolutionByCategory != null ? Collections.unmodifiableList(resolutionByCategory) : null;
    }
}
