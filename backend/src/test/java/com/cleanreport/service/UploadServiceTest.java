package com.cleanreport.service;

import com.cloudinary.Cloudinary;
import com.cleanreport.dto.response.UploadSignatureResponse;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.test.util.ReflectionTestUtils;

import java.util.LinkedHashMap;
import java.util.Map;

import static org.assertj.core.api.Assertions.assertThat;

class UploadServiceTest {

    private static final String TEST_CLOUD_NAME = "test";
    private static final String TEST_API_KEY = "key";
    private static final String TEST_API_SECRET = "secret";
    private static final String TEST_UPLOAD_PRESET = "cleanreport";
    private static final String FIELD_UPLOAD_PRESET = "uploadPreset";
    private static final long MILLIS_PER_SECOND = 1000L;

    private Cloudinary cloudinary;
    private UploadService uploadService;

    @BeforeEach
    void setUp() {
        // apiSignRequest is a pure function — use a real client rather than a mock.
        cloudinary = new Cloudinary(Map.of(
                "cloud_name", TEST_CLOUD_NAME,
                "api_key", TEST_API_KEY,
                "api_secret", TEST_API_SECRET));
        uploadService = new UploadService(cloudinary);
        ReflectionTestUtils.setField(uploadService, FIELD_UPLOAD_PRESET, TEST_UPLOAD_PRESET);
    }

    @Test
    @DisplayName("generateUploadSignature - returns non-null signature")
    void generateUploadSignature_returnsSignature() {
        UploadSignatureResponse response = uploadService.generateUploadSignature();

        assertThat(response).isNotNull();
        assertThat(response.getSignature()).isNotNull().isNotBlank();
    }

    @Test
    @DisplayName("generateUploadSignature - passes through cloudName, apiKey and preset")
    void generateUploadSignature_passesThroughConfig() {
        UploadSignatureResponse response = uploadService.generateUploadSignature();

        assertThat(response.getCloudName()).isEqualTo(TEST_CLOUD_NAME);
        assertThat(response.getApiKey()).isEqualTo(TEST_API_KEY);
        assertThat(response.getUploadPreset()).isEqualTo(TEST_UPLOAD_PRESET);
    }

    @Test
    @DisplayName("generateUploadSignature - timestamp is current unix seconds")
    void generateUploadSignature_timestampInSeconds() {
        long before = System.currentTimeMillis() / MILLIS_PER_SECOND;

        UploadSignatureResponse response = uploadService.generateUploadSignature();

        long after = System.currentTimeMillis() / MILLIS_PER_SECOND;
        assertThat(response.getTimestamp()).isBetween(before, after);
    }

    @Test
    @DisplayName("generateUploadSignature - signature matches Cloudinary signing of timestamp + preset")
    void generateUploadSignature_matchesExpectedSignature() {
        UploadSignatureResponse response = uploadService.generateUploadSignature();

        Map<String, Object> expectedParams = new LinkedHashMap<>();
        expectedParams.put("timestamp", response.getTimestamp());
        expectedParams.put("upload_preset", TEST_UPLOAD_PRESET);
        String expected = cloudinary.apiSignRequest(expectedParams, TEST_API_SECRET);

        assertThat(response.getSignature()).isEqualTo(expected);
    }

    @Test
    @DisplayName("generateUploadSignature - custom preset is signed and returned")
    void generateUploadSignature_customPreset() {
        String customPreset = "axion-circle-reports";
        ReflectionTestUtils.setField(uploadService, FIELD_UPLOAD_PRESET, customPreset);

        UploadSignatureResponse response = uploadService.generateUploadSignature();

        assertThat(response.getUploadPreset()).isEqualTo(customPreset);
        Map<String, Object> expectedParams = new LinkedHashMap<>();
        expectedParams.put("timestamp", response.getTimestamp());
        expectedParams.put("upload_preset", customPreset);
        assertThat(response.getSignature())
                .isEqualTo(cloudinary.apiSignRequest(expectedParams, TEST_API_SECRET));
    }
}
