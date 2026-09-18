package com.insecurebank.game.repository;

import com.insecurebank.game.model.MfaCredential;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface MfaCredentialRepository extends JpaRepository<MfaCredential, Long> {
    Optional<MfaCredential> findByCustomerId(String customerId);
}
