package com.cleanreport.dto.request;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "Update user profile")
public class UpdateProfileRequest {
    @Size(max = 100)
    @Schema(description = "New display name")
    private String displayName;

    @Schema(description = "New avatar URL (Cloudinary URL)")
    private String avatarUrl;
}
