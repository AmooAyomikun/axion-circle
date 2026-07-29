package com.cleanreport.service;

import com.cleanreport.dto.response.AnalyticsDashboardResponse;
import com.cleanreport.dto.response.CategoryResolutionRate;
import com.cleanreport.dto.response.DailyTrendPoint;
import com.cleanreport.model.enums.ReportCategory;
import com.cleanreport.model.enums.ReportStatus;
import com.cleanreport.repository.ReportRepository;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigInteger;
import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneOffset;
import java.time.format.DateTimeFormatter;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class AnalyticsServiceTest {

    private static final int TREND_WINDOW_DAYS = 30;
    private static final int DAYS_PER_WEEK = 7;
    private static final int TOP_AREAS_LIMIT = 10;
    private static final DateTimeFormatter ISO_DAY = DateTimeFormatter.ofPattern("yyyy-MM-dd");

    @Mock private ReportRepository reportRepository;

    @InjectMocks private AnalyticsService analyticsService;

    private static String today() {
        return LocalDate.now(ZoneOffset.UTC).format(ISO_DAY);
    }

    private static String daysAgo(int days) {
        return LocalDate.now(ZoneOffset.UTC).minusDays(days).format(ISO_DAY);
    }

    @Test
    @DisplayName("getDashboard - assembles all five sections, none null")
    void getDashboard_allSectionsPresent() {
        AnalyticsDashboardResponse response = analyticsService.getDashboard();

        assertThat(response).isNotNull();
        assertThat(response.getTrendsLast30Days()).isNotNull().hasSize(TREND_WINDOW_DAYS);
        assertThat(response.getByStatus()).isNotNull().hasSize(ReportStatus.values().length);
        assertThat(response.getByDayOfWeek()).isNotNull().hasSize(DAYS_PER_WEEK);
        assertThat(response.getTopAreas()).isNotNull().isEmpty();
        assertThat(response.getResolutionByCategory()).isNotNull().hasSize(ReportCategory.values().length);
    }

    @Test
    @DisplayName("getDashboard - byStatus reflects per-status counts")
    void getDashboard_statusCounts() {
        when(reportRepository.countByStatus(ReportStatus.REPORTED)).thenReturn(4L);
        when(reportRepository.countByStatus(ReportStatus.ACKNOWLEDGED)).thenReturn(0L);
        when(reportRepository.countByStatus(ReportStatus.IN_PROGRESS)).thenReturn(0L);
        when(reportRepository.countByStatus(ReportStatus.RESOLVED)).thenReturn(9L);

        AnalyticsDashboardResponse response = analyticsService.getDashboard();

        assertThat(response.getByStatus())
                .anySatisfy(s -> {
                    assertThat(s.getName()).isEqualTo("REPORTED");
                    assertThat(s.getValue()).isEqualTo(4L);
                })
                .anySatisfy(s -> {
                    assertThat(s.getName()).isEqualTo("RESOLVED");
                    assertThat(s.getValue()).isEqualTo(9L);
                });
    }

    @Test
    @DisplayName("getDashboard - trend merges created + resolved and fills missing days with zeros")
    void getDashboard_trendMergedAndZeroFilled() {
        when(reportRepository.countCreatedPerDaySince(any(Instant.class)))
                .thenReturn(List.<Object[]>of(new Object[]{today(), BigInteger.valueOf(3L)}));
        when(reportRepository.countResolvedPerDaySince(any(Instant.class)))
                .thenReturn(List.<Object[]>of(new Object[]{today(), 2L}));

        List<DailyTrendPoint> trends = analyticsService.getDashboard().getTrendsLast30Days();

        assertThat(trends).hasSize(TREND_WINDOW_DAYS);
        assertThat(trends.get(0).getDate()).isEqualTo(daysAgo(TREND_WINDOW_DAYS - 1));
        DailyTrendPoint last = trends.get(trends.size() - 1);
        assertThat(last.getDate()).isEqualTo(today());
        assertThat(last.getCreated()).isEqualTo(3L);
        assertThat(last.getResolved()).isEqualTo(2L);
        // Every other day has no data → zero-filled, never null
        assertThat(trends.subList(0, trends.size() - 1))
                .allSatisfy(point -> {
                    assertThat(point.getCreated()).isZero();
                    assertThat(point.getResolved()).isZero();
                });
    }

    @Test
    @DisplayName("getDashboard - day of week maps Postgres DOW to labels, zero-filling gaps")
    void getDashboard_dayOfWeekLabels() {
        when(reportRepository.countGroupedByDayOfWeek()).thenReturn(List.<Object[]>of(
                new Object[]{0, 5L},   // Sunday
                new Object[]{6, 11L}   // Saturday
        ));

        List<com.cleanreport.dto.response.DayOfWeekCount> byDow = analyticsService.getDashboard().getByDayOfWeek();

        assertThat(byDow).hasSize(DAYS_PER_WEEK);
        assertThat(byDow.get(0).getLabel()).isEqualTo("Sun");
        assertThat(byDow.get(0).getReports()).isEqualTo(5L);
        assertThat(byDow.get(6).getLabel()).isEqualTo("Sat");
        assertThat(byDow.get(6).getReports()).isEqualTo(11L);
        assertThat(byDow.get(1).getLabel()).isEqualTo("Mon");
        assertThat(byDow.get(1).getReports()).isZero();
    }

    @Test
    @DisplayName("getDashboard - out-of-range day of week value is ignored")
    void getDashboard_invalidDayOfWeekIgnored() {
        when(reportRepository.countGroupedByDayOfWeek()).thenReturn(List.<Object[]>of(
                new Object[]{7, 99L},   // invalid — Postgres DOW is 0..6
                new Object[]{-1, 42L},  // invalid
                new Object[]{2, 8L}     // Tuesday
        ));

        List<com.cleanreport.dto.response.DayOfWeekCount> byDow = analyticsService.getDashboard().getByDayOfWeek();

        assertThat(byDow).hasSize(DAYS_PER_WEEK);
        assertThat(byDow.get(2).getLabel()).isEqualTo("Tue");
        assertThat(byDow.get(2).getReports()).isEqualTo(8L);
        assertThat(byDow).extracting(com.cleanreport.dto.response.DayOfWeekCount::getReports)
                .doesNotContain(99L, 42L);
    }

    @Test
    @DisplayName("getDashboard - top areas mapped in query order")
    void getDashboard_topAreas() {
        when(reportRepository.findTopAreasByReportCount(TOP_AREAS_LIMIT)).thenReturn(List.<Object[]>of(
                new Object[]{"Bonaberi", 31L},
                new Object[]{"Deido", BigInteger.valueOf(12L)}
        ));

        List<com.cleanreport.dto.response.AreaCount> areas = analyticsService.getDashboard().getTopAreas();

        assertThat(areas).hasSize(2);
        assertThat(areas.get(0).getArea()).isEqualTo("Bonaberi");
        assertThat(areas.get(0).getCount()).isEqualTo(31L);
        assertThat(areas.get(1).getArea()).isEqualTo("Deido");
        assertThat(areas.get(1).getCount()).isEqualTo(12L);
    }

    @Test
    @DisplayName("getDashboard - resolution rate is rounded to one decimal")
    void getDashboard_resolutionRateRounded() {
        stubCategoryCounts(ReportCategory.OVERFLOW, 3L, 1L);

        CategoryResolutionRate overflow = rateFor(analyticsService.getDashboard(), ReportCategory.OVERFLOW);

        assertThat(overflow.getResolutionRate()).isEqualTo(33.3);
    }

    @Test
    @DisplayName("getDashboard - fully resolved category reports 100.0")
    void getDashboard_resolutionRateFull() {
        stubCategoryCounts(ReportCategory.BLOCKED_DRAIN, 4L, 4L);

        CategoryResolutionRate drain = rateFor(analyticsService.getDashboard(), ReportCategory.BLOCKED_DRAIN);

        assertThat(drain.getResolutionRate()).isEqualTo(100.0);
    }

    @Test
    @DisplayName("getDashboard - category with zero reports yields 0.0, not NaN or Infinity")
    void getDashboard_zeroReportCategory_noDivideByZero() {
        // No stubbing: every countByCategory returns the default 0L
        List<CategoryResolutionRate> rates = analyticsService.getDashboard().getResolutionByCategory();

        assertThat(rates).hasSize(ReportCategory.values().length);
        assertThat(rates).allSatisfy(rate -> {
            assertThat(rate.getResolutionRate()).isEqualTo(0.0);
            assertThat(Double.isNaN(rate.getResolutionRate())).isFalse();
            assertThat(Double.isInfinite(rate.getResolutionRate())).isFalse();
        });
    }

    /**
     * Stubs every category so strict stubbing sees no partially-stubbed invocations:
     * the target category gets the given totals, all others report zero.
     */
    private void stubCategoryCounts(ReportCategory target, long total, long resolved) {
        for (ReportCategory category : ReportCategory.values()) {
            boolean isTarget = category == target;
            when(reportRepository.countByCategory(category)).thenReturn(isTarget ? total : 0L);
            when(reportRepository.countByCategoryAndStatus(category, ReportStatus.RESOLVED))
                    .thenReturn(isTarget ? resolved : 0L);
        }
    }

    private CategoryResolutionRate rateFor(AnalyticsDashboardResponse response, ReportCategory category) {
        return response.getResolutionByCategory().stream()
                .filter(rate -> category.name().equals(rate.getCategory()))
                .findFirst()
                .orElseThrow(() -> new AssertionError("Missing category: " + category));
    }
}
