package com.insecurebank.game.util;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.security.Key;
import java.util.Date;

@Component
public class JwtUtil {

    private final Key signingKey;
    private final long sessionExpirationMs;
    private final long accessExpirationMs;

    public JwtUtil(
            @Value("${jwt.secret}") String secret,
            @Value("${jwt.session-expiration}") long sessionExpirationMs,
            @Value("${jwt.access-expiration}") long accessExpirationMs
    ) {
        this.signingKey = Keys.hmacShaKeyFor(secret.getBytes());
        this.sessionExpirationMs = sessionExpirationMs;
        this.accessExpirationMs = accessExpirationMs;
    }

    /** Short-lived token issued right after password check, before MFA is satisfied. */
    public String generateSessionToken(String customerId, boolean mfaVerified) {
        return buildToken(customerId, mfaVerified, sessionExpirationMs);
    }

    /** Longer-lived token issued once MFA has been verified. */
    public String generateAccessToken(String customerId) {
        return buildToken(customerId, true, accessExpirationMs);
    }

    private String buildToken(String customerId, boolean mfaVerified, long expirationMs) {
        Date now = new Date();
        Date expiry = new Date(now.getTime() + expirationMs);

        return Jwts.builder()
                .setSubject(customerId)
                .claim("mfaVerified", mfaVerified)
                .setIssuedAt(now)
                .setExpiration(expiry)
                .signWith(signingKey, SignatureAlgorithm.HS512)
                .compact();
    }

    public Claims parseClaims(String token) {
        return Jwts.parserBuilder()
                .setSigningKey(signingKey)
                .build()
                .parseClaimsJws(token)
                .getBody();
    }

    public boolean validateToken(String token) {
        try {
            parseClaims(token);
            return true;
        } catch (Exception e) {
            return false;
        }
    }

    public String getCustomerIdFromToken(String token) {
        return parseClaims(token).getSubject();
    }

    public boolean isMfaVerifiedInToken(String token) {
        Claims claims = parseClaims(token);
        Object value = claims.get("mfaVerified");
        return Boolean.TRUE.equals(value);
    }
}
