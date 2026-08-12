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

    @Query(value = "SELECT rc.id, u.id AS user_id, u.display_name AS user_name, " +
            "r.name AS reward_name, r.category AS reward_category, r.credits_required AS credits_spent, " +
            "rc.redemption_code, rc.status, rc.claimed_at " +
            "FROM reward_claims rc " +
            "JOIN users u ON u.id = rc.user_id " +
            "JOIN rewards r ON r.id = rc.reward_id " +
            "ORDER BY rc.claimed_at DESC " +
            "LIMIT :limit OFFSET :offset",
           nativeQuery = true)
    List<Object[]> findAllClaimsNative(@Param("limit") int limit, @Param("offset") long offset);

    @Query(value = "SELECT COUNT(*) FROM reward_claims", nativeQuery = true)
    long countAllClaims();

    @Query(value = "SELECT COALESCE(SUM(r.credits_required), 0) FROM reward_claims rc " +
            "JOIN rewards r ON r.id = rc.reward_id WHERE rc.user_id = :userId", nativeQuery = true)
    Integer sumCreditsRedeemedByUserId(@Param("userId") UUID userId);
}
