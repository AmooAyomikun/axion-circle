package com.cleanreport.repository;

import com.cleanreport.model.entity.RewardClaim;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface RewardClaimRepository extends JpaRepository<RewardClaim, UUID> {
    List<RewardClaim> findByUserIdOrderByClaimedAtDesc(UUID userId);
    Page<RewardClaim> findByUserIdOrderByClaimedAtDesc(UUID userId, Pageable pageable);

    @Query(value = "SELECT COALESCE(SUM(r.credits_required), 0) FROM reward_claims rc JOIN rewards r ON r.id = rc.reward_id WHERE rc.user_id = :userId", nativeQuery = true)
    Integer sumCreditsRedeemedByUserId(@Param("userId") UUID userId);
}
