package com.cleanreport.model.entity;
import jakarta.persistence.*;
import lombok.*;
import java.time.Instant;
import java.util.UUID;

@Entity @Table(name = "credit_rules")
@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class CreditRule {
    @Id @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;
    @Column(nullable = false, length = 100)
    private String name;
    @Column(length = 300)
    private String description;
    @Column(nullable = false)
    private Integer credits;
    @Column(name = "event_type", nullable = false, length = 50)
    private String eventType;
    @Column(name = "is_active", nullable = false)
    @Builder.Default private Boolean isActive = true;
    @Column(name = "multiplier")
    @Builder.Default private Double multiplier = 1.0;
    @Column(name = "daily_cap")
    private Integer dailyCap;
    @Column(name = "monthly_cap")
    private Integer monthlyCap;
    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;
    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;
    @PrePersist protected void onCreate() { createdAt = updatedAt = Instant.now(); }
    @PreUpdate protected void onUpdate() { updatedAt = Instant.now(); }
}
