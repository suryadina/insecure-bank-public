package com.insecurebank.game.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

/**
 * Lives in the game-service's OWN game_mfa schema/database -- deliberately
 * separate from the bank's customers table (auth_db). This is the entire
 * point of the shared-credential + separate-MFA-store design.
 */
@Entity
@Table(name = "mfa_credentials")
public class MfaCredential {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "customer_id", nullable = false, unique = true)
    private String customerId;

    // Base32 TOTP seed. Deliberately stored in plaintext for this training app.
    @Column(name = "totp_secret", nullable = false)
    private String totpSecret;

    @Column(name = "enrolled", nullable = false)
    private boolean enrolled = false;

    @Column(name = "verified", nullable = false)
    private boolean verified = false;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt = LocalDateTime.now();

    public MfaCredential() {
    }

    public MfaCredential(String customerId, String totpSecret) {
        this.customerId = customerId;
        this.totpSecret = totpSecret;
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

    public String getTotpSecret() {
        return totpSecret;
    }

    public void setTotpSecret(String totpSecret) {
        this.totpSecret = totpSecret;
    }

    public boolean isEnrolled() {
        return enrolled;
    }

    public void setEnrolled(boolean enrolled) {
        this.enrolled = enrolled;
    }

    public boolean isVerified() {
        return verified;
    }

    public void setVerified(boolean verified) {
        this.verified = verified;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }
}
