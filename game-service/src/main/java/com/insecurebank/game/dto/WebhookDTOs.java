package com.insecurebank.game.dto;

public class WebhookDTOs {

    /**
     * Body accepted by POST /rewards/share-webhook. webhook_url is
     * fully attacker-controlled and the server will POST to it directly --
     * see RewardShareController for the missing SSRF protection.
     */
    public static class ShareWebhookRequest {
        private String webhook_url;
        private String message;
        private String account_number;
        private java.math.BigDecimal amount;
        private String description;
        private String pin;

        public String getWebhook_url() {
            return webhook_url;
        }

        public void setWebhook_url(String webhook_url) {
            this.webhook_url = webhook_url;
        }

        public String getMessage() {
            return message;
        }

        public void setMessage(String message) {
            this.message = message;
        }

        public String getAccount_number() {
            return account_number;
        }

        public void setAccount_number(String account_number) {
            this.account_number = account_number;
        }

        public java.math.BigDecimal getAmount() {
            return amount;
        }

        public void setAmount(java.math.BigDecimal amount) {
            this.amount = amount;
        }

        public String getDescription() {
            return description;
        }

        public void setDescription(String description) {
            this.description = description;
        }

        public String getPin() {
            return pin;
        }

        public void setPin(String pin) {
            this.pin = pin;
        }
    }

    /**
     * Payload the server POSTs to the user-supplied webhook_url. Carries
     * every field from the incoming request (including account_number,
     * amount, description, pin) so the outbound body can be shaped into
     * whatever the destination endpoint expects.
     */
    public static class WebhookPayload {
        private String event;
        private String message;
        private long timestamp;
        private String account_number;
        private java.math.BigDecimal amount;
        private String description;
        private String pin;

        public WebhookPayload(String event, long timestamp, String message, String account_number,
                              java.math.BigDecimal amount, String description, String pin) {
            this.event = event;
            this.timestamp = timestamp;
            this.message = message;
            this.account_number = account_number;
            this.amount = amount;
            this.description = description;
            this.pin = pin;
        }

        public String getEvent() {
            return event;
        }

        public String getMessage() {
            return message;
        }

        public long getTimestamp() {
            return timestamp;
        }

        public String getAccount_number() {
            return account_number;
        }

        public java.math.BigDecimal getAmount() {
            return amount;
        }

        public String getDescription() {
            return description;
        }

        public String getPin() {
            return pin;
        }
    }

    public static class ShareWebhookResponse {
        private String webhookUrl;
        private String webhookResponseStatus;

        public ShareWebhookResponse(String webhookUrl, String webhookResponseStatus) {
            this.webhookUrl = webhookUrl;
            this.webhookResponseStatus = webhookResponseStatus;
        }

        public String getWebhookUrl() {
            return webhookUrl;
        }

        public String getWebhookResponseStatus() {
            return webhookResponseStatus;
        }
    }
}
