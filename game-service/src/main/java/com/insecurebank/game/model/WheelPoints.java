package com.insecurebank.game.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

/**
 * Lucky-wheel points balance, keyed by the bank customer's UUID. Lives in the
 * game-service's OWN game_mfa schema, alongside {@link MfaCredential}.
 */
@Entity
@Table(name = "wheel_points")
public class WheelPoints {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "customer_id", nullable = false, unique = true)
    private String customerId;

    @Column(name = "points", nullable = false)
    private int points = 0;

    @Column(name = "last_spin_at")
    private LocalDateTime lastSpinAt;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt = LocalDateTime.now();

    public WheelPoints() {
    }

    public WheelPoints(String customerId) {
        this.customerId = customerId;
    }

    public Long getId() {
        return id;
    }

    public String getCustomerId() {
        return customerId;
    }

    public void setCustomerId(String customerId) {
        this.customerId = customerId;
    }

    public int getPoints() {
        return points;
    }

    public void setPoints(int points) {
        this.points = points;
    }

    public LocalDateTime getLastSpinAt() {
        return lastSpinAt;
    }

    public void setLastSpinAt(LocalDateTime lastSpinAt) {
        this.lastSpinAt = lastSpinAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }
}
