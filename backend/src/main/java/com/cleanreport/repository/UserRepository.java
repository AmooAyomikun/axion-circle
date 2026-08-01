package com.cleanreport.repository;

import com.cleanreport.model.entity.User;
import com.cleanreport.model.entity.Report;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface UserRepository extends JpaRepository<User, UUID> {
    Optional<User> findByEmail(String email);
    boolean existsByEmail(String email);
    Optional<User> findByPasswordResetToken(String token);

    @Query("SELECT u FROM User u WHERE LOWER(u.displayName) LIKE LOWER(CONCAT('%', :q, '%')) ORDER BY u.displayName ASC")
    List<User> searchByDisplayName(@Param("q") String q, Pageable pageable);

    @Query("SELECT u FROM User u ORDER BY u.creditBalance DESC")
    List<User> findTopByCredits(Pageable pageable);

    @Query(value = "SELECT * FROM users WHERE role = CAST(:role AS user_role) AND (:includeDeleted = TRUE OR deleted_at IS NULL) AND (:inactiveDays = 0 OR last_login_at IS NULL OR last_login_at < NOW() - (:inactiveDays || ' days')::INTERVAL) AND (COALESCE(:search, '') = '' OR LOWER(display_name) LIKE LOWER(CONCAT('%', CAST(:search AS TEXT), '%')) OR LOWER(email) LIKE LOWER(CONCAT('%', CAST(:search AS TEXT), '%'))) ORDER BY created_at DESC LIMIT :limit OFFSET :offset",
           nativeQuery = true)
    List<User> findAllByRoleAndSearch(
            @Param("role") String role,
            @Param("search") String search,
            @Param("includeDeleted") boolean includeDeleted,
            @Param("inactiveDays") int inactiveDays,
            @Param("limit") int limit,
            @Param("offset") long offset);

    @Query(value = "SELECT COUNT(*) FROM users WHERE role = CAST(:role AS user_role) AND (:includeDeleted = TRUE OR deleted_at IS NULL) AND (:inactiveDays = 0 OR last_login_at IS NULL OR last_login_at < NOW() - (:inactiveDays || ' days')::INTERVAL) AND (COALESCE(:search, '') = '' OR LOWER(display_name) LIKE LOWER(CONCAT('%', CAST(:search AS TEXT), '%')) OR LOWER(email) LIKE LOWER(CONCAT('%', CAST(:search AS TEXT), '%')))",
           nativeQuery = true)
    long countByRoleAndSearch(@Param("role") String role, @Param("search") String search, @Param("includeDeleted") boolean includeDeleted, @Param("inactiveDays") int inactiveDays);

    @Query(value = "SELECT * FROM users WHERE (:includeDeleted = TRUE OR deleted_at IS NULL) AND (:inactiveDays = 0 OR last_login_at IS NULL OR last_login_at < NOW() - (:inactiveDays || ' days')::INTERVAL) AND (COALESCE(:search, '') = '' OR LOWER(display_name) LIKE LOWER(CONCAT('%', CAST(:search AS TEXT), '%')) OR LOWER(email) LIKE LOWER(CONCAT('%', CAST(:search AS TEXT), '%'))) ORDER BY created_at DESC LIMIT :limit OFFSET :offset",
           nativeQuery = true)
    List<User> findAllBySearch(
            @Param("search") String search,
            @Param("includeDeleted") boolean includeDeleted,
            @Param("inactiveDays") int inactiveDays,
            @Param("limit") int limit,
            @Param("offset") long offset);

    @Query(value = "SELECT COUNT(*) FROM users WHERE (:includeDeleted = TRUE OR deleted_at IS NULL) AND (:inactiveDays = 0 OR last_login_at IS NULL OR last_login_at < NOW() - (:inactiveDays || ' days')::INTERVAL) AND (COALESCE(:search, '') = '' OR LOWER(display_name) LIKE LOWER(CONCAT('%', CAST(:search AS TEXT), '%')) OR LOWER(email) LIKE LOWER(CONCAT('%', CAST(:search AS TEXT), '%')))",
           nativeQuery = true)
    long countBySearch(@Param("search") String search, @Param("includeDeleted") boolean includeDeleted, @Param("inactiveDays") int inactiveDays);

    @Query("SELECT COUNT(r) FROM Report r WHERE r.reporter.id = :userId")
    Long countReportsByUserId(@Param("userId") UUID userId);
}
