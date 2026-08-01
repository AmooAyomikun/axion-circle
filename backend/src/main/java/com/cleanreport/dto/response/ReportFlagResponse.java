package com.cleanreport.dto.response;

import com.cleanreport.model.enums.FlagType;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "Abuse/quality flag on a report")
public class ReportFlagResponse {
    private UUID id;
    private FlagType flagType;
    private String details;
    private Boolean autoFlagged;
    private String reviewedByName;
    private Instant reviewedAt;
    private Instant createdAt;
}
