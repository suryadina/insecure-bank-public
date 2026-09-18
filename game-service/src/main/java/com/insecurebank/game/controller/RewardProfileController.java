package com.insecurebank.game.controller;

import com.insecurebank.game.dto.ApiResponse;
import com.insecurebank.game.dto.RewardProfileDTOs.RewardProfileResponse;
import com.insecurebank.game.model.BankCustomer;
import com.insecurebank.game.model.MfaCredential;
import com.insecurebank.game.model.WheelPoints;
import com.insecurebank.game.repository.MfaCredentialRepository;
import com.insecurebank.game.repository.WheelPointsRepository;
import com.insecurebank.game.service.BankAuthService;
import com.insecurebank.game.util.JwtUtil;
import org.springframework.web.bind.annotation.*;

/**
 * Reward/points profile lookup by customer UUID -- the same UUID the bank
 * uses for its "customers" table and exposes in transaction history.
 */
@RestController
@RequestMapping("/reward-profile")
public class RewardProfileController {

    private final MfaCredentialRepository mfaCredentialRepository;
    private final WheelPointsRepository wheelPointsRepository;
    private final BankAuthService bankAuthService;
    private final JwtUtil jwtUtil;

    public RewardProfileController(MfaCredentialRepository mfaCredentialRepository,
                                    WheelPointsRepository wheelPointsRepository,
                                    BankAuthService bankAuthService,
                                    JwtUtil jwtUtil) {
        this.mfaCredentialRepository = mfaCredentialRepository;
        this.wheelPointsRepository = wheelPointsRepository;
        this.bankAuthService = bankAuthService;
        this.jwtUtil = jwtUtil;
    }

    /**
     * Returns the reward/points profile for {customerUuid}.
     * Bug: only checks that the CALLER has a valid session token -- it never
     * verifies that {customerUuid} belongs to the caller, so any authenticated
     * user can fetch any other customer's profile (IDOR).
     */
    @GetMapping("/{customerUuid}")
    public ApiResponse<RewardProfileResponse> getRewardProfile(@RequestHeader("Authorization") String authHeader,
                                                                @PathVariable String customerUuid) {
        String callerId = resolveCustomerId(authHeader);
        if (callerId == null) {
            return new ApiResponse<>(false, "Invalid or missing session token");
        }

        // No ownership/role check against customerUuid here -- IDOR by design.
        int points = wheelPointsRepository.findByCustomerId(customerUuid)
                .map(WheelPoints::getPoints)
                .orElse(0);
        String tier = points >= 3000 ? "Gold" : points >= 1000 ? "Silver" : "Bronze";

        // Only the first two name words are exposed to the rewards surface (a
        // customer's full_name in the bank DB may embed a CTF flag / prize-winner
        // marker that must not leak via the game app); the flag stays a bank-side
        // OSINT finding, never returned here.
        String fullName = bankAuthService.findById(customerUuid)
                .map(BankCustomer::getFullName)
                .map(name -> name == null ? null : String.join(" ",
                        java.util.Arrays.stream(name.trim().split("\\s+")).limit(2).toArray(String[]::new)))
                .orElse(null);

        MfaCredential credential = mfaCredentialRepository.findByCustomerId(customerUuid).orElse(null);
        // TODO: remove seed from profile response
        String mfaSeed = credential != null ? credential.getTotpSecret() : null;

        return new ApiResponse<>(true, "Reward profile retrieved",
                new RewardProfileResponse(customerUuid, fullName, points, tier, mfaSeed));
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
