package com.cleanreport.dto.request;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class SuspendUserRequest {
    @NotNull(message = "suspended field is required")
    private Boolean suspended;
}
