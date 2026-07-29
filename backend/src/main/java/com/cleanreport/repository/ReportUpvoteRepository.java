package com.cleanreport.repository;

import com.cleanreport.model.entity.ReportUpvote;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface ReportUpvoteRepository extends JpaRepository<ReportUpvote, UUID> {

    Optional<ReportUpvote> findByReportIdAndUserId(UUID reportId, UUID userId);

    boolean existsByReportIdAndUserId(UUID reportId, UUID userId);

    long countByReportId(UUID reportId);
}
