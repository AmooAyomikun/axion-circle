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
@Schema(description = "Percentage of reports resolved for a given category")
public class CategoryResolutionRate {

    @Schema(description = "Report category", example = "ILLEGAL_DUMPING")
    private String category;

    @Schema(description = "Resolution rate as a percentage (0-100, one decimal). 0 when the category has no reports", example = "62.5")
    private double resolutionRate;
}
