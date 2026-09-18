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

@RestController
@RequestMapping("/auth")
public class AuthController {

    private final GameAuthService gameAuthService;

    public AuthController(GameAuthService gameAuthService) {
        this.gameAuthService = gameAuthService;
    }

    /**
     * Validates shared bank credentials (phone_number + password against the
     * bank's own customers table) and, if valid, returns a pre-MFA session
     * token. The caller must then hit /mfa/enroll or /mfa/verify
     * before receiving a full access token.
     */
    @PostMapping("/login")
    public ApiResponse<LoginResponse> login(@Valid @RequestBody LoginRequest request) {
        return gameAuthService.login(request);
    }
}
