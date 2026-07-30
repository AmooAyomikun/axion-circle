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
@Schema(description = "Top contributor by credit balance")
public class TopContributorResponse {

    private UUID id;

    @Schema(example = "Amaka Obi")
    private String name;

    @Schema(example = "https://res.cloudinary.com/fxwxretv/image/upload/avatar.jpg")
    private String avatarUrl;

    @Schema(example = "350")
    private Integer credits;

    @Schema(example = "GOLD")
    private String level;
}
