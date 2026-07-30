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

    // Global flags (legacy — still supported)
    private Boolean emailEnabled;
    private Boolean pushEnabled;
    private Boolean smsEnabled;

    // Per-category settings
    private CategoryPrefs comments;
    private CategoryPrefs tags;
    private CategoryPrefs reminders;
    private CategoryPrefs moreActivity;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CategoryPrefs {
        private Boolean push;
        private Boolean email;
        private Boolean sms;
    }
}
