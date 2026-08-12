package com.cleanreport.controller;

import com.cleanreport.dto.response.ApiResponse;
import com.cleanreport.exception.ResourceNotFoundException;
import com.cleanreport.model.entity.CreditRule;
import com.cleanreport.model.entity.PartnerStore;
import com.cleanreport.model.entity.Reward;
import com.cleanreport.model.entity.RewardClaim;
import com.cleanreport.repository.CreditRuleRepository;
import com.cleanreport.repository.PartnerStoreRepository;
import com.cleanreport.repository.RewardClaimRepository;
import com.cleanreport.repository.RewardRepository;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/admin")
@RequiredArgsConstructor
@Tag(name = "Admin - Rewards Management", description = "Admin CRUD for rewards, credit rules, partner stores, and redemption requests. Requires ADMIN role.")
public class AdminRewardController {

    private final RewardRepository rewardRepository;
    private final RewardClaimRepository rewardClaimRepository;
    private final CreditRuleRepository creditRuleRepository;
    private final PartnerStoreRepository partnerStoreRepository;

    // ─── REWARD CATALOG ───────────────────────────────────────

    @Operation(summary = "List all rewards including drafts (Admin)", security = @SecurityRequirement(name = "Bearer Auth"))
    @GetMapping("/rewards")
    public ResponseEntity<ApiResponse<List<Reward>>> listRewards() {
        return ResponseEntity.ok(ApiResponse.ok(rewardRepository.findAll(Sort.by("creditsRequired"))));
    }

    @Operation(summary = "Create a new reward (Admin)", security = @SecurityRequirement(name = "Bearer Auth"))
    @PostMapping("/rewards")
    public ResponseEntity<ApiResponse<Reward>> createReward(@RequestBody Reward reward) {
        reward.setId(null);
        Reward saved = rewardRepository.save(reward);
        return ResponseEntity.ok(ApiResponse.created(saved, "Reward created"));
    }

    @Operation(summary = "Update a reward (Admin)", security = @SecurityRequirement(name = "Bearer Auth"))
    @PutMapping("/rewards/{id}")
    public ResponseEntity<ApiResponse<Reward>> updateReward(@PathVariable UUID id, @RequestBody Reward updates) {
        Reward existing = rewardRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Reward not found: " + id));
        if (updates.getName() != null) existing.setName(updates.getName());
        if (updates.getDescription() != null) existing.setDescription(updates.getDescription());
        if (updates.getCreditsRequired() != null) existing.setCreditsRequired(updates.getCreditsRequired());
        if (updates.getQuantityAvailable() != null) existing.setQuantityAvailable(updates.getQuantityAvailable());
        if (updates.getCategory() != null) existing.setCategory(updates.getCategory());
        if (updates.getImageUrl() != null) existing.setImageUrl(updates.getImageUrl());
        if (updates.getIsActive() != null) existing.setIsActive(updates.getIsActive());
        return ResponseEntity.ok(ApiResponse.ok(rewardRepository.save(existing), "Reward updated"));
    }

    @Operation(summary = "Delete a reward (Admin)", security = @SecurityRequirement(name = "Bearer Auth"))
    @DeleteMapping("/rewards/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteReward(@PathVariable UUID id) {
        if (!rewardRepository.existsById(id)) throw new ResourceNotFoundException("Reward not found: " + id);
        rewardRepository.deleteById(id);
        return ResponseEntity.ok(ApiResponse.ok(null, "Reward deleted"));
    }

    // ─── REDEMPTION REQUESTS ──────────────────────────────────

    @Operation(summary = "List all redemption requests (Admin)", security = @SecurityRequirement(name = "Bearer Auth"))
    @GetMapping("/redemption-requests")
    public ResponseEntity<ApiResponse<java.util.Map<String, Object>>> listRedemptionRequests(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        int limit = Math.min(size, 100);
        long offset = (long) page * limit;
        long total = rewardClaimRepository.countAllClaims();
        List<Object[]> rows = rewardClaimRepository.findAllClaimsNative(limit, offset);
        List<java.util.Map<String, Object>> content = rows.stream().map(row -> {
            java.util.Map<String, Object> m = new java.util.LinkedHashMap<>();
            m.put("id", row[0] != null ? row[0].toString() : null);
            m.put("userId", row[1] != null ? row[1].toString() : null);
            m.put("userName", row[2] != null ? row[2].toString() : null);
            m.put("rewardName", row[3] != null ? row[3].toString() : null);
            m.put("rewardCategory", row[4] != null ? row[4].toString() : null);
            m.put("creditsSpent", row[5] != null ? ((Number) row[5]).intValue() : null);
            m.put("redemptionCode", row[6] != null ? row[6].toString() : null);
            m.put("status", row[7] != null ? row[7].toString() : null);
            m.put("claimedAt", row[8] != null ? row[8].toString() : null);
            return m;
        }).toList();
        java.util.Map<String, Object> result = new java.util.LinkedHashMap<>();
        result.put("content", content);
        result.put("totalElements", total);
        result.put("totalPages", (int) Math.ceil((double) total / limit));
        result.put("page", page);
        result.put("size", limit);
        return ResponseEntity.ok(ApiResponse.ok(result));
    }

    @Operation(summary = "Update redemption request status (Admin) — APPROVED, REJECTED, COLLECTED",
            security = @SecurityRequirement(name = "Bearer Auth"))
    @PatchMapping("/redemption-requests/{id}/status")
    public ResponseEntity<ApiResponse<RewardClaim>> updateRedemptionStatus(
            @PathVariable UUID id,
            @RequestBody Map<String, String> body) {
        RewardClaim claim = rewardClaimRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Claim not found: " + id));
        String status = body.get("status");
        if (status == null || status.isBlank()) throw new IllegalArgumentException("status is required");
        try {
            claim.setStatus(com.cleanreport.model.enums.ClaimStatus.valueOf(status.toUpperCase()));
        } catch (IllegalArgumentException e) {
            throw new IllegalArgumentException("Invalid status. Use: PENDING, APPROVED, REJECTED, COLLECTED");
        }
        return ResponseEntity.ok(ApiResponse.ok(rewardClaimRepository.save(claim), "Status updated to " + status));
    }

    // ─── CREDIT RULES ─────────────────────────────────────────

    @Operation(summary = "List all credit rules (Admin)", security = @SecurityRequirement(name = "Bearer Auth"))
    @GetMapping("/credit-rules")
    public ResponseEntity<ApiResponse<List<CreditRule>>> listCreditRules() {
        return ResponseEntity.ok(ApiResponse.ok(creditRuleRepository.findAllByOrderByCreatedAtAsc()));
    }

    @Operation(summary = "Update credit rule (Admin)", security = @SecurityRequirement(name = "Bearer Auth"))
    @PutMapping("/credit-rules/{id}")
    public ResponseEntity<ApiResponse<CreditRule>> updateCreditRule(
            @PathVariable UUID id, @RequestBody CreditRule updates) {
        CreditRule rule = creditRuleRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Credit rule not found: " + id));
        if (updates.getName() != null) rule.setName(updates.getName());
        if (updates.getCredits() != null) rule.setCredits(updates.getCredits());
        if (updates.getDescription() != null) rule.setDescription(updates.getDescription());
        return ResponseEntity.ok(ApiResponse.ok(creditRuleRepository.save(rule), "Credit rule updated"));
    }

    @Operation(summary = "Toggle credit rule active/inactive (Admin)", security = @SecurityRequirement(name = "Bearer Auth"))
    @PatchMapping("/credit-rules/{id}/status")
    public ResponseEntity<ApiResponse<CreditRule>> toggleCreditRule(
            @PathVariable UUID id, @RequestBody Map<String, Boolean> body) {
        CreditRule rule = creditRuleRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Credit rule not found: " + id));
        Boolean isActive = body.get("isActive");
        if (isActive == null) throw new IllegalArgumentException("isActive is required");
        rule.setIsActive(isActive);
        return ResponseEntity.ok(ApiResponse.ok(creditRuleRepository.save(rule),
                isActive ? "Rule activated" : "Rule deactivated"));
    }

    // ─── PARTNER STORES ───────────────────────────────────────

    @Operation(summary = "List all partner stores (Admin)", security = @SecurityRequirement(name = "Bearer Auth"))
    @GetMapping("/partner-stores")
    public ResponseEntity<ApiResponse<List<PartnerStore>>> listPartnerStores() {
        return ResponseEntity.ok(ApiResponse.ok(partnerStoreRepository.findAllByOrderByNameAsc()));
    }

    @Operation(summary = "Create a partner store (Admin)", security = @SecurityRequirement(name = "Bearer Auth"))
    @PostMapping("/partner-stores")
    public ResponseEntity<ApiResponse<PartnerStore>> createPartnerStore(@RequestBody PartnerStore store) {
        store.setId(null);
        return ResponseEntity.ok(ApiResponse.created(partnerStoreRepository.save(store), "Partner store created"));
    }

    @Operation(summary = "Update a partner store (Admin)", security = @SecurityRequirement(name = "Bearer Auth"))
    @PutMapping("/partner-stores/{id}")
    public ResponseEntity<ApiResponse<PartnerStore>> updatePartnerStore(
            @PathVariable UUID id, @RequestBody PartnerStore updates) {
        PartnerStore store = partnerStoreRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Partner store not found: " + id));
        if (updates.getName() != null) store.setName(updates.getName());
        if (updates.getCategory() != null) store.setCategory(updates.getCategory());
        if (updates.getLocation() != null) store.setLocation(updates.getLocation());
        if (updates.getRedemptionLimit() != null) store.setRedemptionLimit(updates.getRedemptionLimit());
        return ResponseEntity.ok(ApiResponse.ok(partnerStoreRepository.save(store), "Partner store updated"));
    }

    @Operation(summary = "Toggle partner store status (Admin) — ACTIVE or SUSPENDED",
            security = @SecurityRequirement(name = "Bearer Auth"))
    @PatchMapping("/partner-stores/{id}/status")
    public ResponseEntity<ApiResponse<PartnerStore>> togglePartnerStore(
            @PathVariable UUID id, @RequestBody Map<String, String> body) {
        PartnerStore store = partnerStoreRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Partner store not found: " + id));
        String status = body.get("status");
        if (!"ACTIVE".equals(status) && !"SUSPENDED".equals(status))
            throw new IllegalArgumentException("status must be ACTIVE or SUSPENDED");
        store.setStatus(status);
        return ResponseEntity.ok(ApiResponse.ok(partnerStoreRepository.save(store), "Status updated to " + status));
    }

    @Operation(summary = "Delete a partner store (Admin)", security = @SecurityRequirement(name = "Bearer Auth"))
    @DeleteMapping("/partner-stores/{id}")
    public ResponseEntity<ApiResponse<Void>> deletePartnerStore(@PathVariable UUID id) {
        if (!partnerStoreRepository.existsById(id)) throw new ResourceNotFoundException("Partner store not found: " + id);
        partnerStoreRepository.deleteById(id);
        return ResponseEntity.ok(ApiResponse.ok(null, "Partner store deleted"));
    }
}
