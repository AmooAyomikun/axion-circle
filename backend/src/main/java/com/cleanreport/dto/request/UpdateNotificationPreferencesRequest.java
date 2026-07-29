package com.cleanreport.dto.request;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "Update notification preferences")
public class UpdateNotificationPreferencesRequest {

    @Schema(description = "Enable/disable email notifications")
    private Boolean emailEnabled;

    @Schema(description = "Enable/disable push notifications")
    private Boolean pushEnabled;

    @Schema(description = "Enable/disable SMS notifications")
    private Boolean smsEnabled;
}
