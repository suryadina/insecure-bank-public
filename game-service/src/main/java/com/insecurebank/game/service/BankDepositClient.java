package com.insecurebank.game.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.insecurebank.game.dto.RewardRedemptionDTOs.DepositRequest;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

/**
 * Calls the bank's REAL transaction-service deposit endpoint to actually land
 * redeemed points as money in a customer's account. Uses the exact
 * DepositRequest payload shape the bank expects (account_number, amount,
 * description) -- see transaction-service/src/types/index.ts.
 *
 * The deposit endpoint is no-auth by the bank's own (existing) design, so no
 * credentials/service key are attached here -- this is a plain internal
 * service-to-service HTTP call.
 */
@Service
public class BankDepositClient {

    private final RestTemplate restTemplate = new RestTemplate();
    private final ObjectMapper objectMapper = new ObjectMapper();

    @Value("${transaction-service.base-url:http://transaction-service:8081}")
    private String transactionServiceBaseUrl;

    public boolean deposit(String accountNumber, long amount, String description) {
        DepositRequest depositRequest = new DepositRequest(accountNumber, amount, description);
        try {
            String response = restTemplate.postForObject(
                    transactionServiceBaseUrl + "/api/transactions/deposit",
                    depositRequest,
                    String.class
            );
            if (response == null) {
                return false;
            }
            JsonNode node = objectMapper.readTree(response);
            return node.path("success").asBoolean(false);
        } catch (Exception e) {
            return false;
        }
    }
}
