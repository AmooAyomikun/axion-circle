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

    @Schema(description = "Global flags (legacy)")
    private Boolean emailEnabled;
    private Boolean pushEnabled;
    private Boolean smsEnabled;

    @Schema(description = "Comment notification settings")
    private CategoryPrefs comments;

    @Schema(description = "Tag/@mention notification settings")
    private CategoryPrefs tags;

    @Schema(description = "Reminder notification settings")
    private CategoryPrefs reminders;

    @Schema(description = "More activity notification settings")
    private CategoryPrefs moreActivity;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CategoryPrefs {
        private Boolean push;
        private Boolean email;
        private Boolean sms;
    }
}
