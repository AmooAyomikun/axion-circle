package com.cleanreport.dto.response;

import com.cleanreport.model.enums.UserLevel;
import com.cleanreport.model.enums.UserRole;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "Full user details for admin management")
public class AdminUserResponse {

    private UUID id;
    private String email;
    private String displayName;
    private String firstName;
    private String lastName;
    private String avatarUrl;
    private String phone;
    private String gender;
    private String address;
    private UserRole role;
    private Boolean emailVerified;
    private Boolean suspended;
    private Boolean deleted;
    private Integer creditBalance;
    private UserLevel level;
    private Integer streakCount;
    private Long totalReports;
    private Instant createdAt;
    private Instant lastLoginAt;

    @Schema(description = "True if user has not logged in for 30+ days or has never logged in")
    private Boolean inactive;
}
