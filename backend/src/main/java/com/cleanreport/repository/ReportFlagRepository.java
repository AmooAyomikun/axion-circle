package com.cleanreport.repository;

import com.cleanreport.model.entity.ReportFlag;
import com.cleanreport.model.enums.FlagType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

@Repository
public interface ReportFlagRepository extends JpaRepository<ReportFlag, UUID> {

    List<ReportFlag> findByReportIdOrderByCreatedAtDesc(UUID reportId);

    @Query("SELECT COUNT(r) FROM Report r WHERE r.reporter.id = :userId AND r.createdAt >= :since")
    long countReportsByUserSince(@Param("userId") UUID userId, @Param("since") Instant since);

    @Query("SELECT COUNT(r) FROM Report r WHERE r.reporter.id = :userId AND r.location = :location")
    long countByReporterAndLocation(@Param("userId") UUID userId, @Param("location") org.locationtech.jts.geom.Point location);

    @Query(value = "SELECT COUNT(*) FROM reports WHERE reporter_id = :userId AND created_at >= :since", nativeQuery = true)
    long countNativeReportsByUserSince(@Param("userId") UUID userId, @Param("since") Instant since);

    @Query(value = "SELECT COUNT(*) FROM reports WHERE photo_hash = :hash AND reporter_id != :userId", nativeQuery = true)
    long countDuplicatePhotoHash(@Param("hash") String hash, @Param("userId") UUID userId);

    @Query(value = "SELECT COUNT(*) FROM reports WHERE reporter_id = :userId AND ST_DWithin(location::geography, ST_MakePoint(:lng, :lat)::geography, 50) AND id != :reportId", nativeQuery = true)
    long countNearbyReportsByUser(@Param("userId") UUID userId, @Param("lng") double lng, @Param("lat") double lat, @Param("reportId") UUID reportId);
}
