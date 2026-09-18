package com.insecurebank.auth.model

import jakarta.persistence.*
import java.time.LocalDateTime

@Entity
@Table(name = "otp_verifications")
data class OtpVerification(
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    val id: Long = 0,
    
    @Column(nullable = false)
    val phoneNumber: String = "",
    
    @Column(nullable = false)
    val otpCode: String = "",
    
    @Column(nullable = false)
    val purpose: String = "", // REGISTRATION, DEVICE_ENROLLMENT, PIN_RESET
    
    @Column(nullable = false)
    val isUsed: Boolean = false,
    
    @Column(nullable = false)
    val createdAt: LocalDateTime = LocalDateTime.now(),
    
    @Column(nullable = false)
    val expiresAt: LocalDateTime = LocalDateTime.now().plusMinutes(5)
)