package com.insecurebank.auth.dto

import java.time.LocalDate

data class RegistrationRequest(
    val phoneNumber: String,
    val ktpNumber: String,
    val fullName: String,
    val dateOfBirth: LocalDate,
    val selfiePath: String?
)

data class OtpVerificationRequest(
    val phoneNumber: String,
    val otpCode: String
)

data class SetPasswordRequest(
    val phoneNumber: String,
    val password: String
)

data class SetPinRequest(
    val phoneNumber: String,
    val pin: String
)

data class ValidatePinRequest(
    val customerId: String,
    val pin: String
)

data class DeviceEnrollmentRequest(
    val phoneNumber: String,
    val password: String,
    val deviceId: String,
    val deviceName: String
)

data class LoginRequest(
    val phoneNumber: String,
    val password: String,
    val deviceId: String
)

data class ForgotPasswordRequest(
    val phoneNumber: String
)

data class ResetPasswordRequest(
    val phoneNumber: String,
    val otpCode: String,
    val newPassword: String
)

data class ChangePasswordRequest(
    val currentPassword: String,
    val newPassword: String
)

data class ChangePinRequest(
    val currentPin: String,
    val newPin: String
)

data class ApiResponse<T>(
    val success: Boolean,
    val message: String,
    val data: T? = null
)

data class AuthResponse(
    val accessToken: String,
    val customerId: String,
    val deviceId: String
)

data class CustomerInquiryResponse(
    val customerId: String,
    val customerName: String,
    val accountNumber: String,
    val accountType: String,
    val isActive: Boolean,
    // Vulnerable: Excessive sensitive data that frontend doesn't need
    val phoneNumber: String,
    val ktpNumber: String, // National ID - very sensitive!
    val dateOfBirth: String,
    val isVerified: Boolean,
    val createdAt: String,
    val updatedAt: String?
)

// DTOs for Transaction Service communication
data class CreateAccountRequest(
    val account_type: String
)

data class CreateAccountResponse(
    val success: Boolean,
    val message: String,
    val data: AccountData?
)

data class AccountData(
    val id: Int,
    val customer_id: String,
    val account_number: String,
    val account_type: String,
    val balance: Double,
    val is_active: Boolean,
    val created_at: String,
    val updated_at: String
)

data class DepositRequest(
    val account_number: String,
    val amount: Double,
    val description: String
)

data class DepositResponse(
    val success: Boolean,
    val message: String,
    val data: TransactionData?
)

data class TransactionData(
    val transaction_id: String,
    val to_account: String,
    val amount: Double,
    val status: String,
    val created_at: String
)

// VULNERABLE: Response that leaks OTP for CTF accessibility
data class DeviceEnrollmentResponse(
    val message: String,
    val otp: String // VULNERABILITY: OTP leaked in response
)

// VULNERABLE: Registration response that leaks OTP for CTF accessibility
data class RegistrationResponse(
    val phoneNumber: String,
    val otp: String // VULNERABILITY: OTP leaked in registration response
)