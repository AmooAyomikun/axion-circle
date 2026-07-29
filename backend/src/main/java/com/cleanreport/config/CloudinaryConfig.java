package com.cleanreport.config;

import com.cloudinary.Cloudinary;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.Map;

/**
 * Exposes a configured {@link Cloudinary} client built from application properties.
 * Credentials come from environment variables (CLOUDINARY_CLOUD_NAME / _API_KEY / _API_SECRET).
 */
@Configuration
public class CloudinaryConfig {

    private static final String CONFIG_CLOUD_NAME = "cloud_name";
    private static final String CONFIG_API_KEY = "api_key";
    private static final String CONFIG_API_SECRET = "api_secret";
    private static final String CONFIG_SECURE = "secure";

    @Value("${cloudinary.cloud-name}")
    private String cloudName;

    @Value("${cloudinary.api-key}")
    private String apiKey;

    @Value("${cloudinary.api-secret}")
    private String apiSecret;

    @Bean
    public Cloudinary cloudinary() {
        return new Cloudinary(Map.of(
                CONFIG_CLOUD_NAME, cloudName,
                CONFIG_API_KEY, apiKey,
                CONFIG_API_SECRET, apiSecret,
                CONFIG_SECURE, true
        ));
    }
}
