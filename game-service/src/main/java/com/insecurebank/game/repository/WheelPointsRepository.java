package com.insecurebank.game.repository;

import com.insecurebank.game.model.WheelPoints;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface WheelPointsRepository extends JpaRepository<WheelPoints, Long> {
    Optional<WheelPoints> findByCustomerId(String customerId);
}
