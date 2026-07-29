package com.cleanreport.dto.response;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "Reports created vs resolved on a single day")
public class DailyTrendPoint {

    @Schema(description = "Day in ISO format (yyyy-MM-dd, UTC)", example = "2026-07-18")
    private String date;

    @Schema(description = "Reports created on that day", example = "12")
    private long created;

    @Schema(description = "Reports resolved on that day", example = "7")
    private long resolved;
}
