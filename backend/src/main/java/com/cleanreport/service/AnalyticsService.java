package com.cleanreport.service;

import com.cleanreport.dto.response.AnalyticsDashboardResponse;
import com.cleanreport.dto.response.AreaCount;
import com.cleanreport.dto.response.CategoryResolutionRate;
import com.cleanreport.dto.response.DailyTrendPoint;
import com.cleanreport.dto.response.DayOfWeekCount;
import com.cleanreport.dto.response.StatusCount;
import com.cleanreport.model.enums.ReportCategory;
import com.cleanreport.model.enums.ReportStatus;
import com.cleanreport.repository.ReportRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneOffset;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * Read-only aggregations powering the admin analytics dashboard.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class AnalyticsService {

    /** Length of the trend window, in days (inclusive of today). */
    private static final int TREND_WINDOW_DAYS = 30;

    /** Maximum number of areas returned in the "top areas" section. */
    private static final int TOP_AREAS_LIMIT = 10;

    /** Postgres EXTRACT(DOW) is 0-based starting on Sunday. */
    private static final String[] DAY_OF_WEEK_LABELS = {"Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"};

    private static final int DAYS_PER_WEEK = DAY_OF_WEEK_LABELS.length;

    /** Percentage scaling factor. */
    private static final double PERCENT_SCALE = 100.0;

    /** Round to one decimal place: round(x * 10) / 10. */
    private static final double ONE_DECIMAL_FACTOR = 10.0;

    private static final long ZERO_COUNT = 0L;
    private static final double ZERO_RATE = 0.0;

    private static final DateTimeFormatter ISO_DAY = DateTimeFormatter.ofPattern("yyyy-MM-dd");

    private static final int COLUMN_KEY = 0;
    private static final int COLUMN_COUNT = 1;

    private final ReportRepository reportRepository;

    /**
     * Assembles every section of the analytics dashboard in a single call.
     */
    public AnalyticsDashboardResponse getDashboard() {
        AnalyticsDashboardResponse response = AnalyticsDashboardResponse.builder()
                .trendsLast30Days(buildTrends())
                .byStatus(buildStatusCounts())
                .byDayOfWeek(buildDayOfWeekCounts())
                .topAreas(buildTopAreas())
                .resolutionByCategory(buildResolutionByCategory())
                .build();

        log.debug("Analytics dashboard assembled: {} trend points, {} areas",
                response.getTrendsLast30Days().size(), response.getTopAreas().size());

        return response;
    }

    /**
     * Merges per-day created counts (reports) and per-day resolved counts (status_history)
     * into a dense 30-day series, filling missing days with zeros.
     */
    private List<DailyTrendPoint> buildTrends() {
        LocalDate startDate = LocalDate.now(ZoneOffset.UTC).minusDays(TREND_WINDOW_DAYS - 1L);
        Instant since = startDate.atStartOfDay(ZoneOffset.UTC).toInstant();

        Map<String, Long> created = toCountsByKey(reportRepository.countCreatedPerDaySince(since));
        Map<String, Long> resolved = toCountsByKey(reportRepository.countResolvedPerDaySince(since));

        List<DailyTrendPoint> trends = new ArrayList<>(TREND_WINDOW_DAYS);
        for (int dayOffset = 0; dayOffset < TREND_WINDOW_DAYS; dayOffset++) {
            String day = startDate.plusDays(dayOffset).format(ISO_DAY);
            trends.add(DailyTrendPoint.builder()
                    .date(day)
                    .created(created.getOrDefault(day, ZERO_COUNT))
                    .resolved(resolved.getOrDefault(day, ZERO_COUNT))
                    .build());
        }
        return trends;
    }

    private List<StatusCount> buildStatusCounts() {
        List<StatusCount> counts = new ArrayList<>();
        for (ReportStatus status : ReportStatus.values()) {
            counts.add(StatusCount.builder()
                    .name(status.name())
                    .value(reportRepository.countByStatus(status))
                    .build());
        }
        return counts;
    }

    /**
     * Returns exactly seven entries, Sunday first, with zeros for weekdays without reports.
     */
    private List<DayOfWeekCount> buildDayOfWeekCounts() {
        long[] byDow = new long[DAYS_PER_WEEK];
        for (Object[] row : reportRepository.countGroupedByDayOfWeek()) {
            int dow = ((Number) row[COLUMN_KEY]).intValue();
            if (dow < 0 || dow >= DAYS_PER_WEEK) {
                log.warn("Unexpected day-of-week value from database: {}", dow);
                continue;
            }
            byDow[dow] = ((Number) row[COLUMN_COUNT]).longValue();
        }

        List<DayOfWeekCount> counts = new ArrayList<>(DAYS_PER_WEEK);
        for (int dow = 0; dow < DAYS_PER_WEEK; dow++) {
            counts.add(DayOfWeekCount.builder()
                    .label(DAY_OF_WEEK_LABELS[dow])
                    .reports(byDow[dow])
                    .build());
        }
        return counts;
    }

    private List<AreaCount> buildTopAreas() {
        List<AreaCount> areas = new ArrayList<>();
        for (Object[] row : reportRepository.findTopAreasByReportCount(TOP_AREAS_LIMIT)) {
            areas.add(AreaCount.builder()
                    .area((String) row[COLUMN_KEY])
                    .count(((Number) row[COLUMN_COUNT]).longValue())
                    .build());
        }
        return areas;
    }

    private List<CategoryResolutionRate> buildResolutionByCategory() {
        List<CategoryResolutionRate> rates = new ArrayList<>();
        for (ReportCategory category : ReportCategory.values()) {
            long total = reportRepository.countByCategory(category);
            long resolved = reportRepository.countByCategoryAndStatus(category, ReportStatus.RESOLVED);
            rates.add(CategoryResolutionRate.builder()
                    .category(category.name())
                    .resolutionRate(resolutionRate(resolved, total))
                    .build());
        }
        return rates;
    }

    /**
     * Percentage rounded to one decimal. Returns 0 when the category has no reports
     * (guards against division by zero producing NaN).
     */
    private double resolutionRate(long resolved, long total) {
        if (total <= ZERO_COUNT) {
            return ZERO_RATE;
        }
        double rate = resolved * PERCENT_SCALE / total;
        return Math.round(rate * ONE_DECIMAL_FACTOR) / ONE_DECIMAL_FACTOR;
    }

    private Map<String, Long> toCountsByKey(List<Object[]> rows) {
        Map<String, Long> counts = new HashMap<>();
        for (Object[] row : rows) {
            counts.put(String.valueOf(row[COLUMN_KEY]), ((Number) row[COLUMN_COUNT]).longValue());
        }
        return counts;
    }
}
