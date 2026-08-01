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

    @Query("SELECT u FROM User u WHERE u.role = :role AND (:search IS NULL OR LOWER(u.displayName) LIKE LOWER(CONCAT('%', :search, '%')) OR LOWER(u.email) LIKE LOWER(CONCAT('%', :search, '%')))")
    org.springframework.data.domain.Page<User> findAllByRoleAndSearch(
            @Param("role") com.cleanreport.model.enums.UserRole role,
            @Param("search") String search,
            Pageable pageable);

    @Query("SELECT u FROM User u WHERE (:search IS NULL OR LOWER(u.displayName) LIKE LOWER(CONCAT('%', :search, '%')) OR LOWER(u.email) LIKE LOWER(CONCAT('%', :search, '%')))")
    org.springframework.data.domain.Page<User> findAllBySearch(
            @Param("search") String search,
            Pageable pageable);

    @Query("SELECT COUNT(r) FROM Report r WHERE r.reporter.id = :userId")
    Long countReportsByUserId(@Param("userId") UUID userId);
}
