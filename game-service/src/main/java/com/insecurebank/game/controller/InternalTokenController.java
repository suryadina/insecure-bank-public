package com.insecurebank.game.controller;

import com.insecurebank.game.dto.ApiResponse;
import com.insecurebank.game.dto.AuthDTOs.LoginRequest;
import com.insecurebank.game.dto.AuthDTOs.LoginResponse;
import com.insecurebank.game.service.GameAuthService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * INTERNAL/LEGACY -- not part of the public game-client API surface and
 * deliberately left out of the login UI and API docs. Pre-dates the TOTP/MFA
 * rollout; some legacy internal tooling still calls straight through here
 * with the customer's shared bank credentials to grab a token without
 * dealing with the MFA enrollment/verification dance.
 *
 * Do NOT link this from any frontend. It is only reachable if you already
 * know the path (e.g. from source review or a leaked build artifact).
 */
@RestController
@RequestMapping("/internal")
public class InternalTokenController {

    private final GameAuthService gameAuthService;

    public InternalTokenController(GameAuthService gameAuthService) {
        this.gameAuthService = gameAuthService;
    }

    /**
     * Same credential check as /auth/login, but skips MFA entirely and
     * returns an already-verified access token. Server never checks whether
     * the caller has enrolled in or completed MFA on this path.
     */
    @PostMapping("/grant-token")
    public ApiResponse<LoginResponse> grantToken(@Valid @RequestBody LoginRequest request) {
        return gameAuthService.grantTokenLegacyNoMfa(request);
    }
}
