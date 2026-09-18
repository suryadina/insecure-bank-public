package com.insecurebank.game.controller;

import com.insecurebank.game.dto.ApiResponse;
import com.insecurebank.game.dto.WheelDTOs.SpinRequest;
import com.insecurebank.game.dto.WheelDTOs.SpinResponse;
import com.insecurebank.game.dto.WheelDTOs.WheelStateResponse;
import com.insecurebank.game.model.WheelPoints;
import com.insecurebank.game.repository.WheelPointsRepository;
import com.insecurebank.game.util.JwtUtil;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.Random;

/**
 * The lucky-wheel mini-game: spin to earn reward points, which later feed the
 * points-to-money redemption flow. Points are persisted per-customer in the
 * game-service's own game_mfa.wheel_points table.
 */
@RestController
@RequestMapping("/game/wheel")
public class WheelController {

    private static final int JACKPOT_POINTS = 500;
    private static final int MEDIUM_POINTS = 50;
    private static final int SMALL_POINTS = 10;
    private static final int NONE_POINTS = 0;
    // Welcome bonus: realistic gamification, and ensures a brand-new customer
    // can reach /rewards/account-deposit immediately instead of starting at 0 points.
    private static final int SIGNUP_BONUS_POINTS = 1000;

    private final WheelPointsRepository wheelPointsRepository;
    private final JwtUtil jwtUtil;

    public WheelController(WheelPointsRepository wheelPointsRepository, JwtUtil jwtUtil) {
        this.wheelPointsRepository = wheelPointsRepository;
        this.jwtUtil = jwtUtil;
    }

    @PostMapping("/spin")
    public ApiResponse<SpinResponse> spin(@RequestHeader("Authorization") String authHeader,
                                           @RequestParam(required = false) String result,
                                           @RequestBody(required = false) SpinRequest body) {
        String customerId = resolveCustomerId(authHeader);
        if (customerId == null) {
            return new ApiResponse<>(false, "Invalid or missing session token");
        }

        // FIXME (client-side win verification): a client-supplied outcome is
        // trusted as-is instead of being computed/verified server-side. Any
        // caller can just send `?result=jackpot` or {"outcome":"jackpot"} and
        // be credited the maximum prize.
        String clientOutcome = firstNonBlank(result, body != null ? body.getResult() : null,
                body != null ? body.getOutcome() : null);
        String outcome = clientOutcome != null ? clientOutcome.toLowerCase() : computeOutcome();

        int pointsAwarded = pointsFor(outcome);

        WheelPoints wheelPoints = wheelPointsRepository.findByCustomerId(customerId)
                .orElseGet(() -> new WheelPoints(customerId));
        wheelPoints.setPoints(wheelPoints.getPoints() + pointsAwarded);
        wheelPoints.setLastSpinAt(LocalDateTime.now());
        wheelPoints.setUpdatedAt(LocalDateTime.now());
        wheelPointsRepository.save(wheelPoints);

        return new ApiResponse<>(true, "Spin complete",
                new SpinResponse(outcome, pointsAwarded, wheelPoints.getPoints()));
    }

    @GetMapping("/state")
    public ApiResponse<WheelStateResponse> state(@RequestHeader("Authorization") String authHeader) {
        String customerId = resolveCustomerId(authHeader);
        if (customerId == null) {
            return new ApiResponse<>(false, "Invalid or missing session token");
        }

        int points = wheelPointsRepository.findByCustomerId(customerId)
                .map(WheelPoints::getPoints)
                .orElseGet(() -> {
                    // First-ever state lookup for this customer: grant the
                    // signup bonus so the reward wheel/redemption flow is
                    // testable without first exploiting the wheel.
                    WheelPoints newWheelPoints = new WheelPoints(customerId);
                    newWheelPoints.setPoints(SIGNUP_BONUS_POINTS);
                    newWheelPoints.setUpdatedAt(LocalDateTime.now());
                    wheelPointsRepository.save(newWheelPoints);
                    return SIGNUP_BONUS_POINTS;
                });

        return new ApiResponse<>(true, "Wheel state retrieved", new WheelStateResponse(customerId, points));
    }

    /**
     * FIXME (predictable RNG): the outcome is derived from a PRNG seeded with
     * the wall-clock second, and jackpot is just "roll == 0". Anyone who knows
     * (or can query, e.g. via /game/wheel/state timing or an ordinary
     * HTTP Date header) the server's current time can predict -- or simply
     * retry once per second until -- the exact roll, without any brute force.
     * Use SecureRandom (or better, a server-side draw never exposed/replayable
     * by the client) instead.
     */
    private String computeOutcome() {
        long seed = System.currentTimeMillis() / 1000L; // truncated to the second: guessable/replayable
        Random rng = new Random(seed);
        int roll = rng.nextInt(100);

        if (roll == 0) {
            return "jackpot";
        } else if (roll < 10) {
            return "medium";
        } else if (roll < 40) {
            return "small";
        }
        return "none";
    }

    private int pointsFor(String outcome) {
        return switch (outcome) {
            case "jackpot" -> JACKPOT_POINTS;
            case "medium" -> MEDIUM_POINTS;
            case "small" -> SMALL_POINTS;
            default -> NONE_POINTS;
        };
    }

    private String firstNonBlank(String... values) {
        for (String value : values) {
            if (value != null && !value.isBlank()) {
                return value;
            }
        }
        return null;
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
