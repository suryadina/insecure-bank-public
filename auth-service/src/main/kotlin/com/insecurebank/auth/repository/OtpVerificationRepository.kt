package com.insecurebank.auth.repository

import com.insecurebank.auth.model.OtpVerification
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.stereotype.Repository

@Repository
interface OtpVerificationRepository : JpaRepository<OtpVerification, Long> {
    fun findByPhoneNumberAndPurposeAndIsUsedFalseOrderByCreatedAtDesc(
        phoneNumber: String, 
        purpose: String
    ): List<OtpVerification>
}