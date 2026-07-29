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
@Schema(description = "Report count for a single status (chart-friendly name/value pair)")
public class StatusCount {

    @Schema(description = "Status name", example = "RESOLVED")
    private String name;

    @Schema(description = "Number of reports in that status", example = "87")
    private long value;
}
