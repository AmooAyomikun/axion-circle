package com.cleanreport.dto.response;

import com.cleanreport.model.enums.ClaimStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.util.UUID;

@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class RewardClaimResponse {
    private UUID id;
    private String rewardName;
    private String rewardCategory;
    private Integer creditsSpent;
    private String redemptionCode;
    private ClaimStatus status;
    private Instant claimedAt;
}
