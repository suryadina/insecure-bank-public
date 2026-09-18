package com.insecurebank.game.service;

import com.insecurebank.game.dto.ApiResponse;
import com.insecurebank.game.dto.AuthDTOs.LoginRequest;
import com.insecurebank.game.dto.AuthDTOs.LoginResponse;
import com.insecurebank.game.model.BankCustomer;
import com.insecurebank.game.model.MfaCredential;
import com.insecurebank.game.repository.MfaCredentialRepository;
import com.insecurebank.game.util.JwtUtil;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
public class GameAuthService {

    private final BankAuthService bankAuthService;
    private final MfaCredentialRepository mfaCredentialRepository;
    private final JwtUtil jwtUtil;

    public GameAuthService(BankAuthService bankAuthService, MfaCredentialRepository mfaCredentialRepository, JwtUtil jwtUtil) {
        this.bankAuthService = bankAuthService;
        this.mfaCredentialRepository = mfaCredentialRepository;
        this.jwtUtil = jwtUtil;
    }

    public ApiResponse<LoginResponse> login(LoginRequest request) {
        Optional<BankCustomer> customerOpt = bankAuthService.findByUsername(request.getUsername());
        if (customerOpt.isEmpty()) {
            return new ApiResponse<>(false, "Invalid username or password");
        }

        BankCustomer customer = customerOpt.get();
        if (!bankAuthService.checkPassword(customer, request.getPassword())) {
            return new ApiResponse<>(false, "Invalid username or password");
        }

        Optional<MfaCredential> mfaOpt = mfaCredentialRepository.findByCustomerId(customer.getId());
        boolean enrolled = mfaOpt.map(MfaCredential::isEnrolled).orElse(false);

        // Pre-MFA session token: proves password check passed, but mfaVerified=false.
        String sessionToken = jwtUtil.generateSessionToken(customer.getId(), false);

        LoginResponse response = new LoginResponse(
                customer.getId(),
                sessionToken,
                enrolled,
                false,
                null
        );

        String message = enrolled
                ? "Password verified. Enter your TOTP code to complete login."
                : "Password verified. MFA enrollment required before login can complete.";

        return new ApiResponse<>(true, message, response);
    }

    /**
     * INTERNAL/LEGACY: pre-dates the TOTP/MFA rollout. Validates shared bank
     * credentials the same way {@link #login} does, but skips the MFA gate
     * entirely and hands back a fully-verified access token straight away.
     * Kept around for legacy game-client integrations that never implemented
     * the MFA step; intentionally not wired into the current login UI.
     *
     * Server-side, nothing distinguishes a caller who went through
     * /mfa/verify from one who hit this endpoint directly -- MFA
     * enrollment/verification is enforced only by the client flow, not here.
     */
    public ApiResponse<LoginResponse> grantTokenLegacyNoMfa(LoginRequest request) {
        Optional<BankCustomer> customerOpt = bankAuthService.findByUsername(request.getUsername());
        if (customerOpt.isEmpty()) {
            return new ApiResponse<>(false, "Invalid username or password");
        }

        BankCustomer customer = customerOpt.get();
        if (!bankAuthService.checkPassword(customer, request.getPassword())) {
            return new ApiResponse<>(false, "Invalid username or password");
        }

        Optional<MfaCredential> mfaOpt = mfaCredentialRepository.findByCustomerId(customer.getId());
        boolean enrolled = mfaOpt.map(MfaCredential::isEnrolled).orElse(false);

        // No enrollment/verification check here -- straight to a full access token.
        String accessToken = jwtUtil.generateAccessToken(customer.getId());

        LoginResponse response = new LoginResponse(
                customer.getId(),
                accessToken,
                enrolled,
                true,
                accessToken
        );

        return new ApiResponse<>(true, "Token granted (legacy no-MFA path)", response);
    }
}
