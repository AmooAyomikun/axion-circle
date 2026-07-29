package com.cleanreport.dto.request;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "Redeem a reward by ID")
public class RedeemRewardRequest {

    @NotNull(message = "rewardId is required")
    @Schema(description = "Reward UUID to redeem")
    private UUID rewardId;
}
