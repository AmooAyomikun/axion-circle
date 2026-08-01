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
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class AdminUserService {

    private final UserRepository userRepository;

    @Transactional(readOnly = true)
    public Page<AdminUserResponse> listUsers(UserRole role, String search, Pageable pageable) {
        String searchTerm = (search != null && !search.isBlank()) ? search.trim() : null;
        return userRepository.findAllByRoleAndSearch(role, searchTerm, pageable)
                .map(this::mapToResponse);
    }

    @Transactional(readOnly = true)
    public AdminUserResponse getUser(UUID userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + userId));
        return mapToResponse(user);
    }

    @Transactional
    public AdminUserResponse updateRole(UUID userId, UpdateUserRoleRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + userId));
        user.setRole(request.getRole());
        userRepository.save(user);
        log.info("Admin updated role for user {} to {}", user.getEmail(), request.getRole());
        return mapToResponse(user);
    }

    @Transactional
    public AdminUserResponse updateSuspension(UUID userId, SuspendUserRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + userId));
        user.setSuspended(request.getSuspended());
        userRepository.save(user);
        log.info("Admin {} user {}", request.getSuspended() ? "suspended" : "unsuspended", user.getEmail());
        return mapToResponse(user);
    }

    private AdminUserResponse mapToResponse(User user) {
        Long totalReports = userRepository.countReportsByUserId(user.getId());
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
                .creditBalance(user.getCreditBalance())
                .level(user.getLevel())
                .streakCount(user.getStreakCount())
                .totalReports(totalReports)
                .createdAt(user.getCreatedAt())
                .build();
    }
}
