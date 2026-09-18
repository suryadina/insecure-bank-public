package com.insecurebank.auth.service

import com.insecurebank.auth.model.OtpVerification
import com.insecurebank.auth.repository.OtpVerificationRepository
import org.springframework.stereotype.Service
import java.time.LocalDateTime
import kotlin.random.Random

@Service
class OtpService(
    private val otpRepository: OtpVerificationRepository
) {
    
    fun generateOtp(phoneNumber: String, purpose: String): String {
        // Generate vulnerable 4-digit OTP (intentionally weak)
        val otp = Random.nextInt(1000, 9999).toString()
        
        val otpVerification = OtpVerification(
            phoneNumber = phoneNumber,
            otpCode = otp,
            purpose = purpose,
            createdAt = LocalDateTime.now(),
            expiresAt = LocalDateTime.now().plusMinutes(5)
        )
        
        otpRepository.save(otpVerification)
        
        // Log OTP to terminal (vulnerable practice)
        println("=".repeat(50))
        println("OTP VERIFICATION CODE")
        println("Phone: $phoneNumber")
        println("Purpose: $purpose")
        println("OTP Code: $otp")
        println("Valid until: ${otpVerification.expiresAt}")
        println("=".repeat(50))
        
        return otp
    }
    
    fun verifyOtp(phoneNumber: String, otpCode: String, purpose: String): Boolean {
        val otpList = otpRepository.findByPhoneNumberAndPurposeAndIsUsedFalseOrderByCreatedAtDesc(
            phoneNumber, purpose
        )
        
        if (otpList.isEmpty()) {
            return false
        }
        
        val latestOtp = otpList.first()
        
        // Check if OTP is expired
        if (LocalDateTime.now().isAfter(latestOtp.expiresAt)) {
            return false
        }
        
        // Vulnerable: Plain text comparison (should use secure comparison)
        if (latestOtp.otpCode == otpCode) {
            // Mark OTP as used
            val updatedOtp = latestOtp.copy(isUsed = true)
            otpRepository.save(updatedOtp)
            return true
        }
        
        return false
    }
}