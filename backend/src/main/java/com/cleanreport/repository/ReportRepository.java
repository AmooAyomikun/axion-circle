package com.cleanreport.repository;

import com.cleanreport.model.entity.Report;
import com.cleanreport.model.enums.ReportCategory;
import com.cleanreport.model.enums.ReportStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

@Repository
public interface ReportRepository extends JpaRepository<Report, UUID>, JpaSpecificationExecutor<Report> {

    Page<Report> findByStatus(ReportStatus status, Pageable pageable);

    Page<Report> findByCategory(ReportCategory category, Pageable pageable);

    Page<Report> findByStatusAndCategory(ReportStatus status, ReportCategory category, Pageable pageable);

    List<Report> findByReporterId(UUID reporterId);

    org.springframework.data.domain.Page<Report> findByReporterIdOrderByCreatedAtDesc(UUID reporterId, Pageable pageable);

    @Query(value = "SELECT * FROM reports r WHERE " +
            "ST_DWithin(r.location::geography, ST_MakePoint(:lng, :lat)::geography, :radiusMeters)",
            nativeQuery = true)
    List<Report> findNearby(@Param("lat") double lat, @Param("lng") double lng,
                            @Param("radiusMeters") double radiusMeters);

    // Full-text search
    @Query(value = "SELECT * FROM reports r WHERE " +
            "to_tsvector('english', COALESCE(r.title, '') || ' ' || COALESCE(r.description, '') || ' ' || COALESCE(r.address, '')) " +
            "@@ plainto_tsquery('english', :keyword) " +
            "ORDER BY r.created_at DESC",
            countQuery = "SELECT count(*) FROM reports r WHERE " +
                    "to_tsvector('english', COALESCE(r.title, '') || ' ' || COALESCE(r.description, '') || ' ' || COALESCE(r.address, '')) " +
                    "@@ plainto_tsquery('english', :keyword)",
            nativeQuery = true)
    Page<Report> searchByKeyword(@Param("keyword") String keyword, Pageable pageable);

    long countByStatus(ReportStatus status);

    long countByCategory(ReportCategory category);

    long countByCategoryAndStatus(ReportCategory category, ReportStatus status);

    // ============================================================
    // Analytics aggregations (native — Postgres date/interval functions)
    // Each row: [0] = day as 'yyyy-MM-dd' String, [1] = count as Number
    // ============================================================

    @Query(value = "SELECT to_char(date_trunc('day', r.created_at), 'YYYY-MM-DD') AS day, COUNT(*) AS cnt " +
            "FROM reports r WHERE r.created_at >= :since " +
            "GROUP BY day ORDER BY day",
            nativeQuery = true)
    List<Object[]> countCreatedPerDaySince(@Param("since") Instant since);

    @Query(value = "SELECT to_char(date_trunc('day', sh.created_at), 'YYYY-MM-DD') AS day, COUNT(*) AS cnt " +
            "FROM status_history sh WHERE CAST(sh.new_status AS TEXT) = 'RESOLVED' AND sh.created_at >= :since " +
            "GROUP BY day ORDER BY day",
            nativeQuery = true)
    List<Object[]> countResolvedPerDaySince(@Param("since") Instant since);

    /**
     * Each row: [0] = Postgres day-of-week (0 = Sunday .. 6 = Saturday), [1] = count.
     */
    @Query(value = "SELECT CAST(EXTRACT(DOW FROM r.created_at) AS INTEGER) AS dow, COUNT(*) AS cnt " +
            "FROM reports r GROUP BY dow ORDER BY dow",
            nativeQuery = true)
    List<Object[]> countGroupedByDayOfWeek();

    /**
     * Each row: [0] = area_name, [1] = count. Ordered by count descending.
     */
    @Query(value = "SELECT r.area_name AS area, COUNT(*) AS cnt " +
            "FROM reports r WHERE r.area_name IS NOT NULL " +
            "GROUP BY r.area_name ORDER BY cnt DESC LIMIT :limit",
            nativeQuery = true)
    List<Object[]> findTopAreasByReportCount(@Param("limit") int limit);

    /**
     * Lightweight map markers — only id, coordinates, status, category, area_name, created_at.
     * No description, photo_url or heavy fields. Used for map rendering.
     */
    @Query(value = "SELECT r.id, ST_Y(r.location::geometry) AS latitude, ST_X(r.location::geometry) AS longitude, " +
            "r.status, r.category, r.area_name, r.created_at " +
            "FROM reports r ORDER BY r.created_at DESC",
            nativeQuery = true)
    List<Object[]> findAllMapMarkers();
}
