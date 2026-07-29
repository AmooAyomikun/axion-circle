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
@Schema(description = "Signed Cloudinary upload parameters")
public class UploadSignatureResponse {

    private String signature;
    private long timestamp;
    private String apiKey;
    private String cloudName;
    private String uploadPreset;
}
