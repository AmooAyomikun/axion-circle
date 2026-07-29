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
@Schema(description = "Report count for a single area")
public class AreaCount {

    @Schema(description = "Area name", example = "Bonabéri")
    private String area;

    @Schema(description = "Number of reports in that area", example = "31")
    private long count;
}
