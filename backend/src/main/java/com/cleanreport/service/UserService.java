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
        return buildPreferencesResponse(user);
    }

    @Transactional
    public NotificationPreferencesResponse updatePreferences(UpdateNotificationPreferencesRequest request, String email) {
        User user = findUser(email);

        // Global flags (legacy)
        if (request.getEmailEnabled() != null) user.setEmailNotifications(request.getEmailEnabled());
        if (request.getPushEnabled() != null) user.setPushNotifications(request.getPushEnabled());
        if (request.getSmsEnabled() != null) user.setSmsNotifications(request.getSmsEnabled());

        // Per-category: comments
        if (request.getComments() != null) {
            if (request.getComments().getPush() != null) user.setNotifCommentsPush(request.getComments().getPush());
            if (request.getComments().getEmail() != null) user.setNotifCommentsEmail(request.getComments().getEmail());
            if (request.getComments().getSms() != null) user.setNotifCommentsSms(request.getComments().getSms());
        }
        // Per-category: tags
        if (request.getTags() != null) {
            if (request.getTags().getPush() != null) user.setNotifTagsPush(request.getTags().getPush());
            if (request.getTags().getEmail() != null) user.setNotifTagsEmail(request.getTags().getEmail());
            if (request.getTags().getSms() != null) user.setNotifTagsSms(request.getTags().getSms());
        }
        // Per-category: reminders
        if (request.getReminders() != null) {
            if (request.getReminders().getPush() != null) user.setNotifRemindersPush(request.getReminders().getPush());
            if (request.getReminders().getEmail() != null) user.setNotifRemindersEmail(request.getReminders().getEmail());
            if (request.getReminders().getSms() != null) user.setNotifRemindersSms(request.getReminders().getSms());
        }
        // Per-category: moreActivity
        if (request.getMoreActivity() != null) {
            if (request.getMoreActivity().getPush() != null) user.setNotifMoreActivityPush(request.getMoreActivity().getPush());
            if (request.getMoreActivity().getEmail() != null) user.setNotifMoreActivityEmail(request.getMoreActivity().getEmail());
            if (request.getMoreActivity().getSms() != null) user.setNotifMoreActivitySms(request.getMoreActivity().getSms());
        }

        userRepository.save(user);
        return buildPreferencesResponse(user);
    }

    private NotificationPreferencesResponse buildPreferencesResponse(User user) {
        return NotificationPreferencesResponse.builder()
                .emailEnabled(user.getEmailNotifications())
                .pushEnabled(user.getPushNotifications())
                .smsEnabled(user.getSmsNotifications())
                .comments(NotificationPreferencesResponse.CategoryPrefs.builder()
                        .push(user.getNotifCommentsPush())
                        .email(user.getNotifCommentsEmail())
                        .sms(user.getNotifCommentsSms())
                        .build())
                .tags(NotificationPreferencesResponse.CategoryPrefs.builder()
                        .push(user.getNotifTagsPush())
                        .email(user.getNotifTagsEmail())
                        .sms(user.getNotifTagsSms())
                        .build())
                .reminders(NotificationPreferencesResponse.CategoryPrefs.builder()
                        .push(user.getNotifRemindersPush())
                        .email(user.getNotifRemindersEmail())
                        .sms(user.getNotifRemindersSms())
                        .build())
                .moreActivity(NotificationPreferencesResponse.CategoryPrefs.builder()
                        .push(user.getNotifMoreActivityPush())
                        .email(user.getNotifMoreActivityEmail())
                        .sms(user.getNotifMoreActivitySms())
                        .build())
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

    public java.util.List<com.cleanreport.dto.response.UserSearchResponse> searchUsers(String q) {
        if (q == null || q.trim().length() < 1) {
            return java.util.List.of();
        }
        return userRepository.searchByDisplayName(q.trim(),
                org.springframework.data.domain.PageRequest.of(0, 10))
                .stream()
                .map(u -> com.cleanreport.dto.response.UserSearchResponse.builder()
                        .id(u.getId())
                        .username(u.getDisplayName() != null ? u.getDisplayName().toLowerCase().replace(" ", "_") : null)
                        .displayName(u.getDisplayName())
                        .avatarUrl(u.getAvatarUrl())
                        .build())
                .toList();
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
