package com.insecurebank.game.model;

/**
 * Read-only projection of a row from the bank's own auth_db.customers table.
 * Not a JPA entity -- fetched via the dedicated bankJdbcTemplate so the
 * bank's customer data is never mixed with game-service's own persistence
 * context (which targets the separate game_mfa schema).
 */
public class BankCustomer {
    private final String id;
    private final String phoneNumber;
    private final String fullName;
    private final String passwordHash;
    private final boolean verified;

    public BankCustomer(String id, String phoneNumber, String fullName, String passwordHash, boolean verified) {
        this.id = id;
        this.phoneNumber = phoneNumber;
        this.fullName = fullName;
        this.passwordHash = passwordHash;
        this.verified = verified;
    }

    public String getId() {
        return id;
    }

    public String getPhoneNumber() {
        return phoneNumber;
    }

    public String getFullName() {
        return fullName;
    }

    public String getPasswordHash() {
        return passwordHash;
    }

    public boolean isVerified() {
        return verified;
    }
}
