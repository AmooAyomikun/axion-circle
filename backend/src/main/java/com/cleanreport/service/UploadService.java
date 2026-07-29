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

        Map<String, Object> paramsToSign = new LinkedHashMap<>();
        paramsToSign.put(PARAM_TIMESTAMP, timestamp);
        paramsToSign.put(PARAM_UPLOAD_PRESET, uploadPreset);

        String signature = cloudinary.apiSignRequest(paramsToSign, cloudinary.config.apiSecret);

        log.debug("Generated Cloudinary upload signature for preset={} at timestamp={}", uploadPreset, timestamp);

        return UploadSignatureResponse.builder()
                .signature(signature)
                .timestamp(timestamp)
                .apiKey(cloudinary.config.apiKey)
                .cloudName(cloudinary.config.cloudName)
                .uploadPreset(uploadPreset)
                .build();
    }
}
