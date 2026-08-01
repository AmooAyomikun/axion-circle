package com.cleanreport.service;

import com.cleanreport.model.entity.Report;
import com.cleanreport.model.entity.ReportFlag;
import com.cleanreport.model.enums.FlagType;
import com.cleanreport.repository.ReportFlagRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.List;

/**
 * Detects reward-farming and abuse patterns on newly submitted reports.
 * Flags are informational — admins review them and decide to REJECT or proceed.
 *
 * Rules:
 * 1. DAILY_LIMIT_EXCEEDED  — more than 15 reports in the last 24h by same user
 * 2. DUPLICATE_IMAGE       — photo_hash matches an existing report from any user
 * 3. RAPID_SUBMISSION      — more than 5 reports in the last 10 minutes
 * 4. DUPLICATE_LOCATION    — same user submitted a report within 50m of this one
 * 5. LOW_QUALITY_PHOTO     — URL looks like a placeholder / test image
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class AbuseDetectionService {

    private static final int DAILY_LIMIT = 15;
    private static final int RAPID_LIMIT = 5;
    private static final int RAPID_WINDOW_MINUTES = 10;

    private final ReportFlagRepository reportFlagRepository;

    @Transactional
    public List<ReportFlag> inspect(Report report) {
        List<ReportFlag> flags = new ArrayList<>();

        // Rule 1: daily limit
        long dailyCount = reportFlagRepository.countNativeReportsByUserSince(
                report.getReporter().getId(),
                Instant.now().minus(24, ChronoUnit.HOURS));
        if (dailyCount > DAILY_LIMIT) {
            flags.add(flag(report, FlagType.DAILY_LIMIT_EXCEEDED,
                    String.format("User submitted %d reports in the last 24h (limit: %d)", dailyCount, DAILY_LIMIT)));
        }

        // Rule 2: duplicate image hash
        if (report.getPhotoHash() != null && !report.getPhotoHash().isBlank()) {
            long dupCount = reportFlagRepository.countDuplicatePhotoHash(
                    report.getPhotoHash(), report.getReporter().getId());
            if (dupCount > 0) {
                flags.add(flag(report, FlagType.DUPLICATE_IMAGE,
                        String.format("Photo hash '%s' already exists in %d other report(s)", report.getPhotoHash(), dupCount)));
            }
        }

        // Rule 3: rapid submission
        long rapidCount = reportFlagRepository.countNativeReportsByUserSince(
                report.getReporter().getId(),
                Instant.now().minus(RAPID_WINDOW_MINUTES, ChronoUnit.MINUTES));
        if (rapidCount > RAPID_LIMIT) {
            flags.add(flag(report, FlagType.RAPID_SUBMISSION,
                    String.format("User submitted %d reports in the last %d minutes (limit: %d)",
                            rapidCount, RAPID_WINDOW_MINUTES, RAPID_LIMIT)));
        }

        // Rule 4: duplicate location (50m radius, same user)
        if (report.getLocation() != null) {
            double lng = report.getLocation().getX();
            double lat = report.getLocation().getY();
            long nearbyCount = reportFlagRepository.countNearbyReportsByUser(
                    report.getReporter().getId(), lng, lat, report.getId());
            if (nearbyCount > 0) {
                flags.add(flag(report, FlagType.DUPLICATE_LOCATION,
                        String.format("User already has %d report(s) within 50m of this location", nearbyCount)));
            }
        }

        // Rule 5: low quality / placeholder photo
        if (isPlaceholderUrl(report.getPhotoUrl())) {
            flags.add(flag(report, FlagType.LOW_QUALITY_PHOTO,
                    "Photo URL appears to be a placeholder or test image: " + report.getPhotoUrl()));
        }

        if (!flags.isEmpty()) {
            List<ReportFlag> saved = reportFlagRepository.saveAll(flags);
            log.warn("Report {} flagged with {} abuse signal(s): {}",
                    report.getReferenceNumber(), saved.size(),
                    saved.stream().map(f -> f.getFlagType().name()).toList());
            return saved;
        }
        return flags;
    }

    private ReportFlag flag(Report report, FlagType type, String details) {
        return ReportFlag.builder()
                .report(report)
                .flagType(type)
                .details(details)
                .autoFlagged(true)
                .build();
    }

    private boolean isPlaceholderUrl(String url) {
        if (url == null) return false;
        String lower = url.toLowerCase();
        return lower.contains("placeholder") || lower.contains("test") ||
               lower.contains("example.com") || lower.contains("lorem") ||
               lower.contains("dummy") || lower.contains("fake") ||
               lower.contains("t.jpg") || lower.contains("t.png");
    }
}
