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

    @Size(max = 100)
    @Schema(description = "First name")
    private String firstName;

    @Size(max = 100)
    @Schema(description = "Middle name")
    private String middleName;

    @Size(max = 100)
    @Schema(description = "Last name")
    private String lastName;

    @Size(max = 30)
    @Schema(description = "Phone number")
    private String phone;

    @Size(max = 20)
    @Schema(description = "Gender")
    private String gender;

    @Size(max = 300)
    @Schema(description = "Address")
    private String address;
}
