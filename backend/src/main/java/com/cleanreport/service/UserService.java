package com.cleanreport.service;

import com.cleanreport.dto.request.ChangePasswordRequest;
import com.cleanreport.dto.request.UpdateNotificationPreferencesRequest;
import com.cleanreport.dto.request.UpdateProfileRequest;
import com.cleanreport.dto.response.NotificationPreferencesResponse;
import com.cleanreport.dto.response.UserResponse;
import com.cleanreport.exception.BadRequestException;
import com.cleanreport.exception.ResourceNotFoundException;
import com.cleanreport.model.entity.User;
import com.cleanreport.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Slf4j
@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public UserResponse getProfile(String email) {
        User user = findUser(email);
        return mapToResponse(user);
    }

    @Transactional
    public UserResponse updateProfile(UpdateProfileRequest request, String email) {
        User user = findUser(email);

        if (request.getDisplayName() != null && !request.getDisplayName().isBlank()) {
            user.setDisplayName(request.getDisplayName().trim());
        }
        if (request.getAvatarUrl() != null && !request.getAvatarUrl().isBlank()) {
            user.setAvatarUrl(request.getAvatarUrl());
        }
        if (request.getFirstName() != null) {
            user.setFirstName(request.getFirstName().trim());
        }
        if (request.getMiddleName() != null) {
            user.setMiddleName(request.getMiddleName().trim());
        }
        if (request.getLastName() != null) {
            user.setLastName(request.getLastName().trim());
        }
        if (request.getPhone() != null) {
            user.setPhone(request.getPhone().trim());
        }
        if (request.getGender() != null) {
            user.setGender(request.getGender().trim());
        }
        if (request.getAddress() != null) {
            user.setAddress(request.getAddress().trim());
        }

        userRepository.save(user);
        return mapToResponse(user);
    }

    public NotificationPreferencesResponse getPreferences(String email) {
        User user = findUser(email);
        return NotificationPreferencesResponse.builder()
                .emailEnabled(user.getEmailNotifications())
                .pushEnabled(user.getPushNotifications())
                .smsEnabled(user.getSmsNotifications())
                .build();
    }

    @Transactional
    public NotificationPreferencesResponse updatePreferences(UpdateNotificationPreferencesRequest request, String email) {
        User user = findUser(email);

        if (request.getEmailEnabled() != null) {
            user.setEmailNotifications(request.getEmailEnabled());
        }
        if (request.getPushEnabled() != null) {
            user.setPushNotifications(request.getPushEnabled());
        }
        if (request.getSmsEnabled() != null) {
            user.setSmsNotifications(request.getSmsEnabled());
        }

        userRepository.save(user);
        return NotificationPreferencesResponse.builder()
                .emailEnabled(user.getEmailNotifications())
                .pushEnabled(user.getPushNotifications())
                .smsEnabled(user.getSmsNotifications())
                .build();
    }

    @Transactional
    public void changePassword(ChangePasswordRequest request, String email) {
        User user = findUser(email);

        if (!passwordEncoder.matches(request.getCurrentPassword(), user.getPasswordHash())) {
            throw new BadRequestException("Current password is incorrect");
        }

        user.setPasswordHash(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);
        log.info("Password changed for user: {}", email);
    }

    private User findUser(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
    }

    public UserResponse mapToResponse(User user) {
        return UserResponse.builder()
                .id(user.getId())
                .email(user.getEmail())
                .displayName(user.getDisplayName())
                .role(user.getRole())
                .creditBalance(user.getCreditBalance())
                .avatarUrl(user.getAvatarUrl())
                .phone(user.getPhone())
                .firstName(user.getFirstName())
                .middleName(user.getMiddleName())
                .lastName(user.getLastName())
                .gender(user.getGender())
                .address(user.getAddress())
                .build();
    }
}
