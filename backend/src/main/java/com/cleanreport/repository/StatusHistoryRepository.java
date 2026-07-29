package com.cleanreport.repository;

import com.cleanreport.model.entity.StatusHistory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface StatusHistoryRepository extends JpaRepository<StatusHistory, UUID> {

    List<StatusHistory> findByReportIdOrderByCreatedAtDesc(UUID reportId);

    /**
     * Average hours between report creation and the first admin action
     * (first status change away from REPORTED) across all reports.
     */
    @Query(value = """
            SELECT AVG(EXTRACT(EPOCH FROM (sh.created_at - r.created_at)) / 3600.0)
            FROM status_history sh
            JOIN reports r ON r.id = sh.report_id
            WHERE sh.new_status IN ('ACKNOWLEDGED', 'IN_PROGRESS', 'RESOLVED')
              AND sh.id = (
                  SELECT sh2.id FROM status_history sh2
                  WHERE sh2.report_id = sh.report_id
                  ORDER BY sh2.created_at ASC
                  LIMIT 1
              )
            """, nativeQuery = true)
    Double findAverageResponseTimeHours();
}
