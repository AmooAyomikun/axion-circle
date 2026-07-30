package com.cleanreport.dto.response;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "User search result for @mention tagging")
public class UserSearchResponse {

    private UUID id;

    @Schema(example = "amaka_obi")
    private String username;

    @Schema(example = "Amaka Obi")
    private String displayName;

    @Schema(example = "https://res.cloudinary.com/fxwxretv/image/upload/avatar.jpg")
    private String avatarUrl;
}
