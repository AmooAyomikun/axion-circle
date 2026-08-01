package com.cleanreport.service;

import com.cleanreport.dto.request.SuspendUserRequest;
import com.cleanreport.dto.request.UpdateUserRoleRequest;
import com.cleanreport.dto.response.AdminUserResponse;
import com.cleanreport.exception.ResourceNotFoundException;
import com.cleanreport.model.entity.User;
import com.cleanreport.model.enums.UserRole;
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
import java.util.List;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class AdminUserService {

    private static final int INACTIVE_THRESHOLD_DAYS = 30;

    private final UserRepository userRepository;

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

    private AdminUserResponse mapToResponse(User user) {
        Long totalReports = userRepository.countReportsByUserId(user.getId());
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
                .createdAt(user.getCreatedAt())
                .lastLoginAt(user.getLastLoginAt())
                .inactive(isInactive)
                .build();
    }
}
