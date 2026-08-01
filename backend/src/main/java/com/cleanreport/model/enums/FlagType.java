package com.cleanreport.model.enums;

public enum FlagType {
    DAILY_LIMIT_EXCEEDED,   // User submitted more than 15 reports in one day
    DUPLICATE_IMAGE,         // Same photo hash already exists in another report
    RAPID_SUBMISSION,        // More than 5 reports in under 10 minutes
    LOW_QUALITY_PHOTO,       // Placeholder URL / test image detected
    SUSPECTED_COORDINATES,  // Coordinates outside expected country/region
    DUPLICATE_LOCATION       // Same GPS coordinates submitted multiple times by same user
}
