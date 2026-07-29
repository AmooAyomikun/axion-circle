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
@Schema(description = "User notification preferences")
public class NotificationPreferencesResponse {

    @Schema(example = "true")
    private Boolean emailEnabled;

    @Schema(example = "true")
    private Boolean pushEnabled;

    @Schema(example = "true")
    private Boolean smsEnabled;
}
