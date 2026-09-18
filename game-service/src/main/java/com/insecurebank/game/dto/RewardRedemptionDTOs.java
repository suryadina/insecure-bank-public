package com.insecurebank.game.dto;

public class RewardRedemptionDTOs {

    /**
     * Body accepted by POST /rewards/account-deposit. Not linked anywhere in
     * the UI's nav/help text -- only reachable via the SPA's "convert to
     * money" button, same as the MFA bypass endpoint.
     */
    public static class RedeemRequest {
        private int points;
        private String account_number;

        public int getPoints() {
            return points;
        }

        public void setPoints(int points) {
            this.points = points;
        }

        public String getAccount_number() {
            return account_number;
        }

        public void setAccount_number(String account_number) {
            this.account_number = account_number;
        }
    }

    /**
     * Mirrors transaction-service's DepositRequest shape EXACTLY (see
     * transaction-service/src/types/index.ts) -- this is the internal payload
     * game-service actually sends to POST /api/transactions/deposit. A
     * student watching the "convert to money" request in Burp/devtools sees
     * this shape and learns the bank's deposit payload from it.
     */
    public static class DepositRequest {
        private String account_number;
        private long amount;
        private String description;

        public DepositRequest(String accountNumber, long amount, String description) {
            this.account_number = accountNumber;
            this.amount = amount;
            this.description = description;
        }

        public String getAccount_number() {
            return account_number;
        }

        public long getAmount() {
            return amount;
        }

        public String getDescription() {
            return description;
        }
    }

    public static class RedeemResponse {
        private int pointsRedeemed;
        private int remainingPoints;
        private long amountDeposited;
        private String accountNumber;

        public RedeemResponse(int pointsRedeemed, int remainingPoints, long amountDeposited, String accountNumber) {
            this.pointsRedeemed = pointsRedeemed;
            this.remainingPoints = remainingPoints;
            this.amountDeposited = amountDeposited;
            this.accountNumber = accountNumber;
        }

        public int getPointsRedeemed() {
            return pointsRedeemed;
        }

        public int getRemainingPoints() {
            return remainingPoints;
        }

        public long getAmountDeposited() {
            return amountDeposited;
        }

        public String getAccountNumber() {
            return accountNumber;
        }
    }
}
