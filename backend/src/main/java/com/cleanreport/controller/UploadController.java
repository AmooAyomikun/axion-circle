package com.cleanreport.controller;

import com.cleanreport.dto.response.ApiResponse;
import com.cleanreport.dto.response.UploadSignatureResponse;
import com.cleanreport.service.UploadService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/upload")
@RequiredArgsConstructor
@Tag(name = "Upload", description = "Secure Cloudinary upload signing")
public class UploadController {

    private final UploadService uploadService;

    @Operation(
            summary = "Get a signed Cloudinary upload payload",
            description = """
                    Returns the parameters required for a direct browser → Cloudinary upload.
                    The API secret never leaves the backend: only a signature over
                    `timestamp` + `upload_preset` is returned.

                    **Client usage:** POST multipart/form-data to
                    `https://api.cloudinary.com/v1_1/{cloudName}/image/upload` with fields
                    `file`, `api_key`, `timestamp`, `upload_preset` and `signature`
                    exactly as returned here. Signatures are short-lived — request a fresh
                    one per upload.

                    **Requires authentication.**
                    """,
            security = @SecurityRequirement(name = "Bearer Auth"))
    @ApiResponses(value = {
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Signature generated"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "401", description = "Not authenticated")
    })
    @GetMapping("/signature")
    public ResponseEntity<ApiResponse<UploadSignatureResponse>> getUploadSignature() {
        UploadSignatureResponse response = uploadService.generateUploadSignature();
        return ResponseEntity.ok(ApiResponse.ok(response));
    }
}
