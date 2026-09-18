package com.insecurebank.game.service;

import com.insecurebank.game.model.MfaCredential;
import com.insecurebank.game.repository.MfaCredentialRepository;
import dev.samstevens.totp.code.CodeVerifier;
import dev.samstevens.totp.code.DefaultCodeGenerator;
import dev.samstevens.totp.code.DefaultCodeVerifier;
import dev.samstevens.totp.qr.QrData;
import dev.samstevens.totp.secret.DefaultSecretGenerator;
import dev.samstevens.totp.secret.SecretGenerator;
import dev.samstevens.totp.time.SystemTimeProvider;
import dev.samstevens.totp.time.TimeProvider;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

/**
 * Google-Authenticator-style TOTP: base32 secret, HMAC-SHA1, 6 digits, 30s step.
 * MFA state (secret/enrolled/verified) is stored in the SEPARATE game_mfa
 * schema via MfaCredentialRepository -- never in the bank's customer tables.
 */
@Service
public class MfaService {

    private static final String ISSUER = "InsecureBank-Game";

    private final MfaCredentialRepository mfaCredentialRepository;
    private final SecretGenerator secretGenerator = new DefaultSecretGenerator();
    private final TimeProvider timeProvider = new SystemTimeProvider();
    private final CodeVerifier codeVerifier = new DefaultCodeVerifier(new DefaultCodeGenerator(), timeProvider);

    public MfaService(MfaCredentialRepository mfaCredentialRepository) {
        this.mfaCredentialRepository = mfaCredentialRepository;
    }

    public MfaCredential getOrCreate(String customerId) {
        return mfaCredentialRepository.findByCustomerId(customerId)
                .orElseGet(() -> mfaCredentialRepository.save(
                        new MfaCredential(customerId, secretGenerator.generate())
                ));
    }

    public String buildOtpAuthUrl(String customerId, String secret) {
        QrData data = new QrData.Builder()
                .label(customerId)
                .secret(secret)
                .issuer(ISSUER)
                .algorithm(dev.samstevens.totp.code.HashingAlgorithm.SHA1)
                .digits(6)
                .period(30)
                .build();
        return data.getUri();
    }

    public boolean verifyCode(MfaCredential credential, String code) {
        boolean valid = codeVerifier.isValidCode(credential.getTotpSecret(), code);
        if (valid) {
            credential.setEnrolled(true);
            credential.setVerified(true);
            credential.setUpdatedAt(LocalDateTime.now());
            mfaCredentialRepository.save(credential);
        }
        return valid;
    }
}
