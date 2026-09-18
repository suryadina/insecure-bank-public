package com.insecurebank.game.controller;

import com.insecurebank.game.dto.ApiResponse;
import com.insecurebank.game.dto.WebhookDTOs.ShareWebhookRequest;
import com.insecurebank.game.dto.WebhookDTOs.ShareWebhookResponse;
import com.insecurebank.game.dto.WebhookDTOs.WebhookPayload;
import com.insecurebank.game.util.JwtUtil;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestTemplate;

/**
 * "Share your reward" webhook integration -- lets a player register a
 * callback URL that the server notifies whenever they want to brag about a
 * win (a common gamification/integrations pattern, e.g. Discord/Slack
 * incoming webhooks).
 */
@RestController
@RequestMapping("/rewards")
public class RewardShareController {

    private final JwtUtil jwtUtil;
    private final RestTemplate restTemplate = new RestTemplate();

    public RewardShareController(JwtUtil jwtUtil) {
        this.jwtUtil = jwtUtil;
    }

    @PostMapping("/share-webhook")
    public ApiResponse<ShareWebhookResponse> shareWebhook(@RequestHeader("Authorization") String authHeader,
                                                            @RequestBody ShareWebhookRequest request) {
        String customerId = resolveCustomerId(authHeader);
        if (customerId == null) {
            return new ApiResponse<>(false, "Invalid or missing session token");
        }

        if (request == null || request.getWebhook_url() == null || request.getWebhook_url().isBlank()) {
            return new ApiResponse<>(false, "webhook_url is required");
        }

        // TODO: validate webhook_url is not internal (no check for
        // localhost/private IP ranges/docker service names -- the server will
        // happily POST to any URL supplied by the player, including internal
        // services on this docker network).
        WebhookPayload payload = new WebhookPayload(
                "reward_share",
                System.currentTimeMillis(),
                request.getMessage(),
                request.getAccount_number(),
                request.getAmount(),
                request.getDescription(),
                request.getPin());

        String status;
        try {
            ResponseEntity<String> response = restTemplate.postForEntity(
                    request.getWebhook_url(), payload, String.class);
            status = "HTTP " + response.getStatusCode().value();
        } catch (RestClientException e) {
            status = "error: " + e.getMessage();
        }

        return new ApiResponse<>(true, "Webhook notified",
                new ShareWebhookResponse(request.getWebhook_url(), status));
    }

    private String resolveCustomerId(String authHeader) {
        if (authHeader == null) {
            return null;
        }
        String token = authHeader.replace("Bearer ", "");
        if (!jwtUtil.validateToken(token)) {
            return null;
        }
        return jwtUtil.getCustomerIdFromToken(token);
    }
}
