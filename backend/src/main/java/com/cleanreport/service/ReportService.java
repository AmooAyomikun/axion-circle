package com.cleanreport.service;

import com.cleanreport.dto.request.CreateReportRequest;
import com.cleanreport.dto.response.DashboardStatsResponse;
import com.cleanreport.dto.response.ReportResponse;
import com.cleanreport.exception.ResourceNotFoundException;
import com.cleanreport.model.entity.Report;
import com.cleanreport.model.entity.User;
import com.cleanreport.model.enums.ReportCategory;
import com.cleanreport.model.enums.ReportStatus;
import com.cleanreport.model.enums.ReportUrgency;
import com.cleanreport.repository.ReportRepository;
import com.cleanreport.repository.ReportUpvoteRepository;
import com.cleanreport.repository.UserRepository;
import com.cleanreport.model.entity.ReportUpvote;
import com.cleanreport.util.ReferenceNumberGenerator;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.locationtech.jts.geom.Coordinate;
import org.locationtech.jts.geom.GeometryFactory;
import org.locationtech.jts.geom.Point;
import org.locationtech.jts.geom.PrecisionModel;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class ReportService {

    private static final int SRID_WGS84 = 4326;

    private final ReportRepository reportRepository;
    private final UserRepository userRepository;
    private final ReportUpvoteRepository reportUpvoteRepository;
    private final GeocodingService geocodingService;
    private final CreditService creditService;
    private final GeometryFactory geometryFactory = new GeometryFactory(new PrecisionModel(), SRID_WGS84);

    @Transactional
    public ReportResponse createReport(CreateReportRequest request, String reporterEmail) {
        User reporter = userRepository.findByEmail(reporterEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + reporterEmail));

        Report saved = reportRepository.save(buildReport(request, reporter));
        log.info("Report created: {} by user {}", saved.getReferenceNumber(), reporter.getEmail());

        // Award credits for report submission
        creditService.awardReportSubmitCredits(reporter, saved);

        return mapToResponse(saved);
    }

    /**
     * Create multiple reports in a single transaction (offline sync).
     * All-or-nothing: if any report fails validation, the whole batch is rolled back.
     */
    @Transactional
    public List<ReportResponse> createReportsBulk(List<CreateReportRequest> requests, String reporterEmail) {
        User reporter = userRepository.findByEmail(reporterEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + reporterEmail));

        List<Report> saved = requests.stream()
                .map(request -> reportRepository.save(buildReport(request, reporter)))
                .toList();

        saved.forEach(report -> creditService.awardReportSubmitCredits(reporter, report));
        log.info("Bulk created {} reports for user {}", saved.size(), reporter.getEmail());

        return saved.stream().map(this::mapToResponse).toList();
    }

    private Report buildReport(CreateReportRequest request, User reporter) {
        Point location = geometryFactory.createPoint(new Coordinate(request.getLongitude(), request.getLatitude()));
        location.setSRID(SRID_WGS84);

        // Auto-fill address via reverse geocoding if not provided
        String address = request.getAddress();
        if (address == null || address.isBlank()) {
            address = geocodingService.reverseGeocode(request.getLatitude(), request.getLongitude());
        }

        return Report.builder()
                .referenceNumber(ReferenceNumberGenerator.generate())
                .reporter(reporter)
                .title(request.getTitle())
                .photoUrl(request.getPhotoUrl())
                .location(location)
                .description(request.getDescription())
                .address(address)
                .areaName(extractAreaName(address))
                .category(request.getCategory())
                .status(ReportStatus.REPORTED)
                .urgency(request.getUrgency() != null ? request.getUrgency() : ReportUrgency.ROUTINE)
                .isAnonymous(request.getIsAnonymous() != null ? request.getIsAnonymous() : false)
                .build();
    }

    public ReportResponse getReportById(UUID id) {
        return getReportById(id, null);
    }

    public ReportResponse getReportById(UUID id, String currentUserEmail) {
        Report report = reportRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Report not found: " + id));
        UUID currentUserId = currentUserEmail == null ? null :
                userRepository.findByEmail(currentUserEmail).map(User::getId).orElse(null);
        return mapToResponse(report, currentUserId);
    }

    /**
     * Toggle upvote on a report: adds an upvote if not present, removes it if already upvoted.
     * Returns the updated upvote count and the user's new upvote status.
     */
    @Transactional
    public ReportResponse toggleUpvote(UUID reportId, String userEmail) {
        Report report = reportRepository.findById(reportId)
                .orElseThrow(() -> new ResourceNotFoundException("Report not found: " + reportId));
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + userEmail));

        var existing = reportUpvoteRepository.findByReportIdAndUserId(reportId, user.getId());
        if (existing.isPresent()) {
            reportUpvoteRepository.delete(existing.get());
            log.info("Upvote removed from report {} by {}", reportId, userEmail);
        } else {
            reportUpvoteRepository.save(ReportUpvote.builder().report(report).user(user).build());
            log.info("Upvote added to report {} by {}", reportId, userEmail);
        }

        return mapToResponse(report, user.getId());
    }

    public Page<ReportResponse> getReports(ReportStatus status, ReportCategory category, Pageable pageable) {
        Page<Report> reports;

        if (status != null && category != null) {
            reports = reportRepository.findByStatusAndCategory(status, category, pageable);
        } else if (status != null) {
            reports = reportRepository.findByStatus(status, pageable);
        } else if (category != null) {
            reports = reportRepository.findByCategory(category, pageable);
        } else {
            reports = reportRepository.findAll(pageable);
        }

        return reports.map(this::mapToResponse);
    }

    public List<ReportResponse> getNearbyReports(double lat, double lng, double radiusKm) {
        double radiusMeters = radiusKm * 1000;
        return reportRepository.findNearby(lat, lng, radiusMeters)
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    public List<ReportResponse> getMyReports(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + email));
        return reportRepository.findByReporterId(user.getId())
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    /**
     * Full-text search across report title, description, and address.
     */
    public Page<ReportResponse> searchReports(String keyword, Pageable pageable) {
        return reportRepository.searchByKeyword(keyword, pageable)
                .map(this::mapToResponse);
    }

    /**
     * Dashboard statistics: totals by status and category.
     */
    public DashboardStatsResponse getDashboardStats() {
        long total = reportRepository.count();

        Map<String, Long> byStatus = new LinkedHashMap<>();
        for (ReportStatus status : ReportStatus.values()) {
            byStatus.put(status.name(), reportRepository.countByStatus(status));
        }

        Map<String, Long> byCategory = new LinkedHashMap<>();
        for (ReportCategory category : ReportCategory.values()) {
            byCategory.put(category.name(), reportRepository.countByCategory(category));
        }

        long resolved = byStatus.getOrDefault("RESOLVED", 0L);
        long pending = total - resolved;

        long totalUsers = userRepository.count();

        return DashboardStatsResponse.builder()
                .totalReports(total)
                .resolvedReports(resolved)
                .pendingReports(pending)
                .byStatus(byStatus)
                .byCategory(byCategory)
                .totalCreditsEarned(total * 10) // Each report = 10 credits
                .totalUsers(totalUsers)
                .build();
    }

    /**
     * Admin report listing with advanced filters (date range, area, all status/category combos).
     */
    public Page<ReportResponse> getAdminReports(ReportStatus status, ReportCategory category,
                                                 Instant from, Instant to, String area, Pageable pageable) {
        Specification<Report> spec = Specification.where(null);

        if (status != null) {
            spec = spec.and((root, query, cb) -> cb.equal(root.get("status"), status));
        }
        if (category != null) {
            spec = spec.and((root, query, cb) -> cb.equal(root.get("category"), category));
        }
        if (from != null) {
            spec = spec.and((root, query, cb) -> cb.greaterThanOrEqualTo(root.get("createdAt"), from));
        }
        if (to != null) {
            spec = spec.and((root, query, cb) -> cb.lessThan(root.get("createdAt"), to));
        }
        if (area != null && !area.isBlank()) {
            spec = spec.and((root, query, cb) -> cb.like(cb.lower(root.get("areaName")), "%" + area.toLowerCase() + "%"));
        }

        return reportRepository.findAll(spec, pageable).map(this::mapToResponse);
    }

    /**
     * Extract area/district name from full address (first part before comma).
     */
    private String extractAreaName(String address) {
        if (address == null || address.isBlank()) return null;
        String[] parts = address.split(",");
        return parts[0].trim();
    }

    private ReportResponse mapToResponse(Report report) {
        return mapToResponse(report, null);
    }

    private ReportResponse mapToResponse(Report report, UUID currentUserId) {
        String reporterName = report.getIsAnonymous() ? "Anonymous" : report.getReporter().getDisplayName();
        String reporterAvatarUrl = report.getIsAnonymous() ? null : report.getReporter().getAvatarUrl();
        int upvotesCount = (int) reportUpvoteRepository.countByReportId(report.getId());
        boolean hasUpvoted = currentUserId != null &&
                reportUpvoteRepository.existsByReportIdAndUserId(report.getId(), currentUserId);

        return ReportResponse.builder()
                .id(report.getId())
                .referenceNumber(report.getReferenceNumber())
                .reporterId(report.getReporter().getId())
                .reporterName(reporterName)
                .reporterAvatarUrl(reporterAvatarUrl)
                .title(report.getTitle())
                .photoUrl(report.getPhotoUrl())
                .photoAfterUrl(report.getPhotoAfterUrl())
                .latitude(report.getLocation().getY())
                .longitude(report.getLocation().getX())
                .description(report.getDescription())
                .address(report.getAddress())
                .category(report.getCategory())
                .status(report.getStatus())
                .urgency(report.getUrgency())
                .isAnonymous(report.getIsAnonymous())
                .areaName(report.getAreaName())
                .upvotesCount(upvotesCount)
                .hasUpvoted(hasUpvoted)
                .createdAt(report.getCreatedAt())
                .updatedAt(report.getUpdatedAt())
                .build();
    }
}
