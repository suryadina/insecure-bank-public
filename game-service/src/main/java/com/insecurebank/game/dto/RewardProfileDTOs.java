package com.insecurebank.game.dto;

public class RewardProfileDTOs {

    public static class RewardProfileResponse {
        private String customerId;
        private String fullName;
        private int points;
        private String tier;
        // TODO: remove seed from profile response
        private String mfaSeed;

        public RewardProfileResponse(String customerId, String fullName, int points, String tier, String mfaSeed) {
            this.customerId = customerId;
            this.fullName = fullName;
            this.points = points;
            this.tier = tier;
            this.mfaSeed = mfaSeed;
        }

        public String getCustomerId() {
            return customerId;
        }

        public String getFullName() {
            return fullName;
        }

        public int getPoints() {
            return points;
        }

        public String getTier() {
            return tier;
        }

        public String getMfaSeed() {
            return mfaSeed;
        }
    }
}
