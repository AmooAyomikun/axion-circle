package com.cleanreport.model.entity;
import jakarta.persistence.*;
import lombok.*;
import java.time.Instant;
import java.util.UUID;

@Entity @Table(name = "partner_stores")
@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class PartnerStore {
    @Id @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;
    @Column(nullable = false, length = 200)
    private String name;
    @Column(length = 100)
    private String category;
    @Column(length = 300)
    private String location;
    @Column(name = "redemption_limit")
    @Builder.Default private Integer redemptionLimit = 0;
    @Column(nullable = false, length = 20)
    @Builder.Default private String status = "ACTIVE";
    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;
    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;
    @PrePersist protected void onCreate() { createdAt = updatedAt = Instant.now(); }
    @PreUpdate protected void onUpdate() { updatedAt = Instant.now(); }
}
