package com.cleanreport.dto.response;

import com.cleanreport.model.enums.ReportCategory;
import com.cleanreport.model.enums.ReportStatus;
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
@Schema(description = "Lightweight report marker for map rendering — no heavy fields like description or photoUrl")
public class MapMarkerResponse {
    private UUID id;
    private Double latitude;
    private Double longitude;
    private ReportStatus status;
    private ReportCategory category;
    private String areaName;
    private Instant createdAt;
}
