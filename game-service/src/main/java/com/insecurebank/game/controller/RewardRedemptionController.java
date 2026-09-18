package com.insecurebank.game.controller;

import com.insecurebank.game.dto.ApiResponse;
import com.insecurebank.game.dto.MyAccount;
import com.insecurebank.game.dto.RewardRedemptionDTOs.RedeemRequest;
import com.insecurebank.game.dto.RewardRedemptionDTOs.RedeemResponse;
import com.insecurebank.game.model.WheelPoints;
import com.insecurebank.game.repository.WheelPointsRepository;
import com.insecurebank.game.service.BankAccountLookupService;
import com.insecurebank.game.service.BankDepositClient;
import com.insecurebank.game.util.JwtUtil;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

/**
 * Points -> money redemption. Converts lucky-wheel points into real IDR and
 * deposits it into a bank account by calling transaction-service's real
 * deposit endpoint with its real DepositRequest payload shape.
 *
 * Deliberately NOT linked from any nav/menu -- only the SPA's "convert to
 * money" action calls it, so a student has to watch network traffic to find
 * it (same discoverability model as the MFA bypass endpoint).
 */
@RestController
@RequestMapping("/rewards")
public class RewardRedemptionController {

    private static final long IDR_PER_POINT = 1000L;

    private final WheelPointsRepository wheelPointsRepository;
    private final JwtUtil jwtUtil;
    private final BankDepositClient bankDepositClient;
    private final BankAccountLookupService bankAccountLookupService;

    public RewardRedemptionController(WheelPointsRepository wheelPointsRepository,
                                       JwtUtil jwtUtil,
                                       BankDepositClient bankDepositClient,
                                       BankAccountLookupService bankAccountLookupService) {
        this.wheelPointsRepository = wheelPointsRepository;
        this.jwtUtil = jwtUtil;
        this.bankDepositClient = bankDepositClient;
        this.bankAccountLookupService = bankAccountLookupService;
    }

    /**
     * Read-only helper for the redeem page's destination-account dropdown.
     * Does not restrict what account_number /rewards/account-deposit will
     * accept -- that endpoint still trusts whatever the client sends.
     */
    @GetMapping("/my-accounts")
    public ApiResponse<List<MyAccount>> myAccounts(@RequestHeader("Authorization") String authHeader) {
        String customerId = resolveCustomerId(authHeader);
        if (customerId == null) {
            return new ApiResponse<>(false, "Invalid or missing session token");
        }
        List<MyAccount> accounts = bankAccountLookupService.findAccountsByCustomerId(customerId);
        return new ApiResponse<>(true, "OK", accounts);
    }

    @PostMapping("/account-deposit")
    public ApiResponse<RedeemResponse> redeem(@RequestHeader("Authorization") String authHeader,
                                               @RequestBody RedeemRequest request) {
        String customerId = resolveCustomerId(authHeader);
        if (customerId == null) {
            return new ApiResponse<>(false, "Invalid or missing session token");
        }

        if (request == null || request.getPoints() <= 0 || request.getAccount_number() == null
                || request.getAccount_number().isBlank()) {
            return new ApiResponse<>(false, "points and account_number are required");
        }

        WheelPoints wheelPoints = wheelPointsRepository.findByCustomerId(customerId).orElse(null);
        if (wheelPoints == null || wheelPoints.getPoints() < request.getPoints()) {
            return new ApiResponse<>(false, "Not enough points");
        }

        long amount = request.getPoints() * IDR_PER_POINT;
        String accountNumber = request.getAccount_number().trim();

        boolean depositSucceeded = bankDepositClient.deposit(accountNumber, amount, "Reward points redemption");
        if (!depositSucceeded) {
            return new ApiResponse<>(false, "Deposit failed: account not found or unreachable");
        }

        wheelPoints.setPoints(wheelPoints.getPoints() - request.getPoints());
        wheelPoints.setUpdatedAt(LocalDateTime.now());
        wheelPointsRepository.save(wheelPoints);

        return new ApiResponse<>(true, "Points redeemed",
                new RedeemResponse(request.getPoints(), wheelPoints.getPoints(), amount, accountNumber));
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
