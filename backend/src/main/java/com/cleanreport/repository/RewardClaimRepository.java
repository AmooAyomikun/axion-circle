package com.cleanreport.repository;

import com.cleanreport.model.entity.RewardClaim;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface RewardClaimRepository extends JpaRepository<RewardClaim, UUID> {
    List<RewardClaim> findByUserIdOrderByClaimedAtDesc(UUID userId);
    Page<RewardClaim> findByUserIdOrderByClaimedAtDesc(UUID userId, Pageable pageable);
}
