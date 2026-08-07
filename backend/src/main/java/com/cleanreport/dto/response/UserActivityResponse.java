package com.cleanreport.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.util.UUID;

@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class UserActivityResponse {
    private UUID id;
    private String type;           // REPORT_SUBMITTED, REWARD_CLAIMED
    private String description;
    private Integer creditsChange; // positive = earned, negative = spent
    private Instant timestamp;
}
