package com.insecurebank.game.dto;

import jakarta.validation.constraints.NotBlank;

public class MfaDTOs {

    public static class EnrollResponse {
        private String secret;
        private String otpAuthUrl;

        public EnrollResponse(String secret, String otpAuthUrl) {
            this.secret = secret;
            this.otpAuthUrl = otpAuthUrl;
        }

        public String getSecret() {
            return secret;
        }

        public String getOtpAuthUrl() {
            return otpAuthUrl;
        }
    }

    public static class VerifyRequest {
        @NotBlank
        private String code;

        public String getCode() {
            return code;
        }

        public void setCode(String code) {
            this.code = code;
        }
    }

    public static class VerifyResponse {
        private String accessToken;

        public VerifyResponse(String accessToken) {
            this.accessToken = accessToken;
        }

        public String getAccessToken() {
            return accessToken;
        }
    }

    public static class StatusResponse {
        private boolean enrolled;
        private boolean verified;

        public StatusResponse(boolean enrolled, boolean verified) {
            this.enrolled = enrolled;
            this.verified = verified;
        }

        public boolean isEnrolled() {
            return enrolled;
        }

        public boolean isVerified() {
            return verified;
        }
    }
}
