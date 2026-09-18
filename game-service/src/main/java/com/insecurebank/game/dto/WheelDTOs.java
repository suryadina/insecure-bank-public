package com.insecurebank.game.dto;

public class WheelDTOs {

    /**
     * Body accepted by POST /game/wheel/spin. The {@code outcome} field
     * is optional -- and, deliberately, the server trusts it when present
     * instead of always computing the result itself server-side.
     */
    public static class SpinRequest {
        private String outcome;
        private String result;

        public String getOutcome() {
            return outcome;
        }

        public void setOutcome(String outcome) {
            this.outcome = outcome;
        }

        // Alias accepted alongside "outcome" so `{ "result": "jackpot" }` also works.
        public String getResult() {
            return result;
        }

        public void setResult(String result) {
            this.result = result;
        }
    }

    public static class SpinResponse {
        private String outcome;
        private int pointsAwarded;
        private int totalPoints;

        public SpinResponse(String outcome, int pointsAwarded, int totalPoints) {
            this.outcome = outcome;
            this.pointsAwarded = pointsAwarded;
            this.totalPoints = totalPoints;
        }

        public String getOutcome() {
            return outcome;
        }

        public int getPointsAwarded() {
            return pointsAwarded;
        }

        public int getTotalPoints() {
            return totalPoints;
        }
    }

    public static class WheelStateResponse {
        private String customerId;
        private int points;

        public WheelStateResponse(String customerId, int points) {
            this.customerId = customerId;
            this.points = points;
        }

        public String getCustomerId() {
            return customerId;
        }

        public int getPoints() {
            return points;
        }
    }
}
