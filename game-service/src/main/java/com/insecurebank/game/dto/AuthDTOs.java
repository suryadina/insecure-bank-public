package com.insecurebank.game.dto;

import jakarta.validation.constraints.NotBlank;

public class AuthDTOs {

    public static class LoginRequest {
        @NotBlank
        private String username; // the bank's phone_number is the login identifier

        @NotBlank
        private String password;

        public String getUsername() {
            return username;
        }

        public void setUsername(String username) {
            this.username = username;
        }

        public String getPassword() {
            return password;
        }

        public void setPassword(String password) {
            this.password = password;
        }
    }

    public static class LoginResponse {
        private String customerId;
        private String sessionToken;
        private boolean mfaEnrolled;
        private boolean mfaVerified;
        private String accessToken; // only set once MFA (or enrollment bypass) is satisfied

        public LoginResponse(String customerId, String sessionToken, boolean mfaEnrolled, boolean mfaVerified, String accessToken) {
            this.customerId = customerId;
            this.sessionToken = sessionToken;
            this.mfaEnrolled = mfaEnrolled;
            this.mfaVerified = mfaVerified;
            this.accessToken = accessToken;
        }

        public String getCustomerId() {
            return customerId;
        }

        public String getSessionToken() {
            return sessionToken;
        }

        public boolean isMfaEnrolled() {
            return mfaEnrolled;
        }

        public boolean isMfaVerified() {
            return mfaVerified;
        }

        public String getAccessToken() {
            return accessToken;
        }
    }
}
