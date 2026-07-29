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
@Schema(description = "Report count grouped by day of the week")
public class DayOfWeekCount {

    @Schema(description = "Short day label", example = "Mon")
    private String label;

    @Schema(description = "Number of reports created on that weekday", example = "24")
    private long reports;
}
