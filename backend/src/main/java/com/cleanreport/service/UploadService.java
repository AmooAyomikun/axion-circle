package com.cleanreport.service;

import com.cloudinary.Cloudinary;
import com.cleanreport.dto.response.UploadSignatureResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.util.LinkedHashMap;
import java.util.Map;

/**
 * Generates short-lived signatures so clients can upload directly to Cloudinary
 * without the API secret ever leaving the backend.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class UploadService {

    private static final String PARAM_TIMESTAMP = "timestamp";
    private static final String PARAM_UPLOAD_PRESET = "upload_preset";
    private static final long MILLIS_PER_SECOND = 1000L;

    private final Cloudinary cloudinary;

    @Value("${cloudinary.upload-preset:cleanreport}")
    private String uploadPreset;

    /**
     * Builds a signed parameter set for a direct (browser → Cloudinary) upload.
     * The signature covers exactly the parameters the client must send back.
     */
    public UploadSignatureResponse generateUploadSignature() {
        long timestamp = System.currentTimeMillis() / MILLIS_PER_SECOND;

        // Read directly from env at runtime (avoids lazy-init @Value injection issue)
        String apiKey = System.getenv("CLOUDINARY_API_KEY") != null ? System.getenv("CLOUDINARY_API_KEY") : cloudinary.config.apiKey;
        String cloudName = System.getenv("CLOUDINARY_CLOUD_NAME") != null ? System.getenv("CLOUDINARY_CLOUD_NAME") : cloudinary.config.cloudName;
        String apiSecret = System.getenv("CLOUDINARY_API_SECRET") != null ? System.getenv("CLOUDINARY_API_SECRET") : cloudinary.config.apiSecret;

        Map<String, Object> paramsToSign = new LinkedHashMap<>();
        paramsToSign.put(PARAM_TIMESTAMP, timestamp);
        paramsToSign.put(PARAM_UPLOAD_PRESET, uploadPreset);

        String signature = cloudinary.apiSignRequest(paramsToSign, apiSecret);

        log.debug("Generated Cloudinary upload signature for preset={} at timestamp={}", uploadPreset, timestamp);

        return UploadSignatureResponse.builder()
                .signature(signature)
                .timestamp(timestamp)
                .apiKey(apiKey)
                .cloudName(cloudName)
                .uploadPreset(uploadPreset)
                .build();
    }
}
