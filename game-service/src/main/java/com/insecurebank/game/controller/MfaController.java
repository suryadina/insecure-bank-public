package com.insecurebank.game.controller;

import com.insecurebank.game.dto.ApiResponse;
import com.insecurebank.game.dto.MfaDTOs.EnrollResponse;
import com.insecurebank.game.dto.MfaDTOs.StatusResponse;
import com.insecurebank.game.dto.MfaDTOs.VerifyRequest;
import com.insecurebank.game.dto.MfaDTOs.VerifyResponse;
import com.insecurebank.game.model.MfaCredential;
import com.insecurebank.game.repository.MfaCredentialRepository;
import com.insecurebank.game.service.MfaService;
import com.insecurebank.game.util.JwtUtil;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/mfa")
public class MfaController {

    private final MfaService mfaService;
    private final MfaCredentialRepository mfaCredentialRepository;
    private final JwtUtil jwtUtil;

    public MfaController(MfaService mfaService, MfaCredentialRepository mfaCredentialRepository, JwtUtil jwtUtil) {
        this.mfaService = mfaService;
        this.mfaCredentialRepository = mfaCredentialRepository;
        this.jwtUtil = jwtUtil;
    }

    /** Returns the TOTP secret + otpauth:// provisioning URI to add to Google Authenticator. */
    @PostMapping("/enroll")
    public ApiResponse<EnrollResponse> enroll(@RequestHeader("Authorization") String authHeader) {
        String customerId = resolveCustomerId(authHeader);
        if (customerId == null) {
            return new ApiResponse<>(false, "Invalid or missing session token");
        }

        MfaCredential credential = mfaService.getOrCreate(customerId);
        String otpAuthUrl = mfaService.buildOtpAuthUrl(customerId, credential.getTotpSecret());

        return new ApiResponse<>(true, "Scan this with Google Authenticator, then call /mfa/verify",
                new EnrollResponse(credential.getTotpSecret(), otpAuthUrl));
    }

    /** Verifies a 6-digit TOTP code and, if valid, issues a full access token. */
    @PostMapping("/verify")
    public ApiResponse<VerifyResponse> verify(@RequestHeader("Authorization") String authHeader,
                                               @Valid @RequestBody VerifyRequest request) {
        String customerId = resolveCustomerId(authHeader);
        if (customerId == null) {
            return new ApiResponse<>(false, "Invalid or missing session token");
        }

        MfaCredential credential = mfaCredentialRepository.findByCustomerId(customerId).orElse(null);
        if (credential == null) {
            return new ApiResponse<>(false, "MFA not enrolled. Call /mfa/enroll first.");
        }

        boolean valid = mfaService.verifyCode(credential, request.getCode());
        if (!valid) {
            return new ApiResponse<>(false, "Invalid TOTP code");
        }

        String accessToken = jwtUtil.generateAccessToken(customerId);
        return new ApiResponse<>(true, "MFA verified", new VerifyResponse(accessToken));
    }

    /** Reports enrollment + verification status for the authenticated customer. */
    @PostMapping("/status")
    public ApiResponse<StatusResponse> status(@RequestHeader("Authorization") String authHeader) {
        String customerId = resolveCustomerId(authHeader);
        if (customerId == null) {
            return new ApiResponse<>(false, "Invalid or missing session token");
        }

        MfaCredential credential = mfaCredentialRepository.findByCustomerId(customerId).orElse(null);
        if (credential == null) {
            return new ApiResponse<>(true, "Not enrolled", new StatusResponse(false, false));
        }

        return new ApiResponse<>(true, "Status retrieved",
                new StatusResponse(credential.isEnrolled(), credential.isVerified()));
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
