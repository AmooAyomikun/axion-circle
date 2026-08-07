package com.cleanreport.service;

import com.cleanreport.dto.request.SuspendUserRequest;
import com.cleanreport.dto.request.UpdateUserRoleRequest;
import com.cleanreport.dto.response.AdminUserResponse;
import com.cleanreport.dto.response.ReportResponse;
import com.cleanreport.dto.response.RewardClaimResponse;
import com.cleanreport.dto.response.UserActivityResponse;
import com.cleanreport.exception.ResourceNotFoundException;
import com.cleanreport.model.entity.Report;
import com.cleanreport.model.entity.RewardClaim;
import com.cleanreport.model.entity.User;
import com.cleanreport.model.enums.ReportStatus;
import com.cleanreport.model.enums.UserRole;
import com.cleanreport.repository.ReportFlagRepository;
import com.cleanreport.repository.ReportRepository;
import com.cleanreport.repository.ReportUpvoteRepository;
import com.cleanreport.repository.RewardClaimRepository;
import com.cleanreport.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class AdminUserService {

    private static final int INACTIVE_THRESHOLD_DAYS = 30;

    private final UserRepository userRepository;
    private final ReportRepository reportRepository;
    private final ReportUpvoteRepository reportUpvoteRepository;
    private final ReportFlagRepository reportFlagRepository;
    private final RewardClaimRepository rewardClaimRepository;

    @Transactional(readOnly = true)
    public Page<AdminUserResponse> listUsers(UserRole role, String search,
                                              boolean includeDeleted, boolean inactiveOnly,
                                              Pageable pageable) {
        String searchTerm = (search != null && !search.isBlank()) ? search.trim() : "";
        int inactiveDays = inactiveOnly ? INACTIVE_THRESHOLD_DAYS : 0;
        int limit = pageable.getPageSize();
        long offset = pageable.getOffset();

        List<User> users;
        long total;
        if (role != null) {
            users = userRepository.findAllByRoleAndSearch(role.name(), searchTerm, includeDeleted, inactiveDays, limit, offset);
            total = userRepository.countByRoleAndSearch(role.name(), searchTerm, includeDeleted, inactiveDays);
        } else {
            users = userRepository.findAllBySearch(searchTerm, includeDeleted, inactiveDays, limit, offset);
            total = userRepository.countBySearch(searchTerm, includeDeleted, inactiveDays);
        }
        List<AdminUserResponse> content = users.stream().map(this::mapToResponse).toList();
        return new PageImpl<>(content, pageable, total);
    }

    @Transactional(readOnly = true)
    public AdminUserResponse getUser(UUID userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + userId));
        return mapToResponse(user);
    }

    @Transactional
    public AdminUserResponse updateRole(UUID userId, UpdateUserRoleRequest request) {
        User user = findActiveUser(userId);
        user.setRole(request.getRole());
        userRepository.save(user);
        log.info("Admin updated role for user {} to {}", user.getEmail(), request.getRole());
        return mapToResponse(user);
    }

    @Transactional
    public AdminUserResponse updateSuspension(UUID userId, SuspendUserRequest request) {
        User user = findActiveUser(userId);
        user.setSuspended(request.getSuspended());
        userRepository.save(user);
        log.info("Admin {} user {}", Boolean.TRUE.equals(request.getSuspended()) ? "suspended" : "unsuspended", user.getEmail());
        return mapToResponse(user);
    }

    @Transactional
    public AdminUserResponse softDelete(UUID userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + userId));
        if (user.getDeletedAt() != null) {
            throw new IllegalArgumentException("User is already deleted");
        }
        user.setDeletedAt(Instant.now());
        userRepository.save(user);
        log.info("Admin soft-deleted user {}", user.getEmail());
        return mapToResponse(user);
    }

    @Transactional
    public AdminUserResponse restore(UUID userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + userId));
        if (user.getDeletedAt() == null) {
            throw new IllegalArgumentException("User is not deleted");
        }
        user.setDeletedAt(null);
        userRepository.save(user);
        log.info("Admin restored user {}", user.getEmail());
        return mapToResponse(user);
    }

    private User findActiveUser(UUID userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + userId));
        if (user.getDeletedAt() != null) {
            throw new IllegalArgumentException("Cannot modify a deleted user. Restore the user first.");
        }
        return user;
    }

    @Transactional(readOnly = true)
    public Page<ReportResponse> getUserReports(UUID userId, Pageable pageable) {
        userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + userId));
        return reportRepository.findByReporterIdOrderByCreatedAtDesc(userId, pageable)
                .map(r -> {
                    int upvotes = (int) reportUpvoteRepository.countByReportId(r.getId());
                    int flags = reportFlagRepository.findByReportIdOrderByCreatedAtDesc(r.getId()).size();
                    String rName = Boolean.TRUE.equals(r.getIsAnonymous()) ? "Anonymous" : r.getReporter().getDisplayName();
                    return ReportResponse.builder()
                            .id(r.getId()).referenceNumber(r.getReferenceNumber())
                            .reporterId(r.getReporter().getId()).reporterName(rName)
                            .title(r.getTitle()).photoUrl(r.getPhotoUrl())
                            .latitude(r.getLocation().getY()).longitude(r.getLocation().getX())
                            .address(r.getAddress()).areaName(r.getAreaName())
                            .category(r.getCategory()).status(r.getStatus()).urgency(r.getUrgency())
                            .isAnonymous(r.getIsAnonymous())
                            .upvotesCount(upvotes).hasUpvoted(false).flagCount(flags)
                            .createdAt(r.getCreatedAt()).updatedAt(r.getUpdatedAt())
                            .build();
                });
    }

    @Transactional(readOnly = true)
    public Page<RewardClaimResponse> getUserRewards(UUID userId, Pageable pageable) {
        userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + userId));
        return rewardClaimRepository.findByUserIdOrderByClaimedAtDesc(userId, pageable)
                .map(c -> RewardClaimResponse.builder()
                        .id(c.getId())
                        .rewardName(c.getReward().getName())
                        .rewardCategory(c.getReward().getCategory())
                        .creditsSpent(c.getReward().getCreditsRequired())
                        .redemptionCode(c.getRedemptionCode())
                        .status(c.getStatus())
                        .claimedAt(c.getClaimedAt())
                        .build());
    }

    @Transactional(readOnly = true)
    public Page<UserActivityResponse> getUserActivity(UUID userId, Pageable pageable) {
        userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + userId));

        List<UserActivityResponse> activities = new ArrayList<>();

        // Report submissions
        reportRepository.findByReporterId(userId).forEach(r ->
                activities.add(UserActivityResponse.builder()
                        .id(r.getId())
                        .type("REPORT_SUBMITTED")
                        .description("Submitted report: " + r.getTitle() + " (" + r.getReferenceNumber() + ")")
                        .creditsChange(2)
                        .timestamp(r.getCreatedAt())
                        .build()));

        // Reward claims
        rewardClaimRepository.findByUserIdOrderByClaimedAtDesc(userId).forEach(c ->
                activities.add(UserActivityResponse.builder()
                        .id(c.getId())
                        .type("REWARD_CLAIMED")
                        .description("Claimed reward: " + c.getReward().getName())
                        .creditsChange(-c.getReward().getCreditsRequired())
                        .timestamp(c.getClaimedAt())
                        .build()));

        activities.sort(Comparator.comparing(UserActivityResponse::getTimestamp).reversed());

        int start = (int) pageable.getOffset();
        int end = Math.min(start + pageable.getPageSize(), activities.size());
        List<UserActivityResponse> pageContent = start >= activities.size()
                ? List.of() : activities.subList(start, end);
        return new PageImpl<>(pageContent, pageable, activities.size());
    }

    private AdminUserResponse mapToResponse(User user) {
        Long totalReports = reportRepository.countByReporterId(user.getId());
        Long resolvedReports = reportRepository.countByReporterIdAndStatus(user.getId(), ReportStatus.RESOLVED);
        Integer creditsRedeemed = rewardClaimRepository.sumCreditsRedeemedByUserId(user.getId());
        boolean isInactive = user.getLastLoginAt() == null
                || user.getLastLoginAt().isBefore(Instant.now().minus(INACTIVE_THRESHOLD_DAYS, ChronoUnit.DAYS));
        return AdminUserResponse.builder()
                .id(user.getId())
                .email(user.getEmail())
                .displayName(user.getDisplayName())
                .firstName(user.getFirstName())
                .lastName(user.getLastName())
                .avatarUrl(user.getAvatarUrl())
                .phone(user.getPhone())
                .gender(user.getGender())
                .address(user.getAddress())
                .role(user.getRole())
                .emailVerified(user.getEmailVerified())
                .suspended(user.getSuspended())
                .deleted(user.getDeletedAt() != null)
                .creditBalance(user.getCreditBalance())
                .level(user.getLevel())
                .streakCount(user.getStreakCount())
                .totalReports(totalReports)
                .resolvedReports(resolvedReports)
                .creditsRedeemed(creditsRedeemed != null ? creditsRedeemed : 0)
                .createdAt(user.getCreatedAt())
                .lastLoginAt(user.getLastLoginAt())
                .inactive(isInactive)
                .build();
    }
}
