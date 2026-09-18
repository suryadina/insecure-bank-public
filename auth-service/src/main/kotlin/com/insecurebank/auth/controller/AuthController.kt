package com.insecurebank.auth.controller

import com.insecurebank.auth.dto.*
import com.insecurebank.auth.model.Customer
import com.insecurebank.auth.service.AuthService
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.*

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = ["*"]) // Vulnerable: Allow all origins
class AuthController(
    private val authService: AuthService
) {
    
    @PostMapping("/register")
    fun register(@RequestBody request: RegistrationRequest): ResponseEntity<ApiResponse<RegistrationResponse>> {
        val response = authService.registerCustomer(request)
        return ResponseEntity.ok(response)
    }
    
    @PostMapping("/verify-registration")
    fun verifyRegistration(@RequestBody request: OtpVerificationRequest): ResponseEntity<ApiResponse<String>> {
        val response = authService.verifyRegistrationOtp(request)
        return ResponseEntity.ok(response)
    }
    
    @PostMapping("/set-password")
    fun setPassword(@RequestBody request: SetPasswordRequest): ResponseEntity<ApiResponse<String>> {
        val response = authService.setPassword(request)
        return ResponseEntity.ok(response)
    }
    
    @PostMapping("/set-pin")
    fun setPin(@RequestBody request: SetPinRequest): ResponseEntity<ApiResponse<String>> {
        val response = authService.setPin(request)
        return ResponseEntity.ok(response)
    }
    
    @PostMapping("/validate-pin")
    fun validatePin(@RequestBody request: ValidatePinRequest): ResponseEntity<ApiResponse<Boolean>> {
        val response = authService.validatePin(request)
        return ResponseEntity.ok(response)
    }
    
    @PostMapping("/enroll-device")
    fun enrollDevice(@RequestBody request: DeviceEnrollmentRequest): ResponseEntity<ApiResponse<DeviceEnrollmentResponse>> {
        val response = authService.enrollDevice(request)
        return ResponseEntity.ok(response)
    }
    
    @PostMapping("/verify-device-enrollment")
    fun verifyDeviceEnrollment(
        @RequestBody otpRequest: OtpVerificationRequest,
        @RequestParam deviceId: String,
        @RequestParam deviceName: String,
        @RequestParam password: String
    ): ResponseEntity<ApiResponse<AuthResponse>> {
        val enrollmentRequest = DeviceEnrollmentRequest(
            phoneNumber = otpRequest.phoneNumber,
            password = password,
            deviceId = deviceId,
            deviceName = deviceName
        )
        
        val response = authService.verifyDeviceEnrollment(
            otpRequest.phoneNumber, 
            otpRequest.otpCode, 
            enrollmentRequest
        )
        return ResponseEntity.ok(response)
    }
    
    @PostMapping("/login")
    fun login(@RequestBody request: LoginRequest): ResponseEntity<ApiResponse<AuthResponse>> {
        val response = authService.loginWithDevice(request)
        return ResponseEntity.ok(response)
    }
    
    @PostMapping("/forgot-password")
    fun forgotPassword(@RequestBody request: ForgotPasswordRequest): ResponseEntity<ApiResponse<String>> {
        val response = authService.forgotPassword(request)
        return ResponseEntity.ok(response)
    }
    
    @PostMapping("/reset-password")
    fun resetPassword(@RequestBody request: ResetPasswordRequest): ResponseEntity<ApiResponse<String>> {
        val response = authService.resetPassword(request)
        return ResponseEntity.ok(response)
    }
    
    @GetMapping("/profile")
    fun getProfile(@RequestHeader("Authorization") authHeader: String): ResponseEntity<ApiResponse<Customer>> {
        val response = authService.getCustomerProfile(authHeader)
        return ResponseEntity.ok(response)
    }
    
    @PostMapping("/change-password")
    fun changePassword(
        @RequestHeader("Authorization") authHeader: String,
        @RequestBody request: ChangePasswordRequest
    ): ResponseEntity<ApiResponse<String>> {
        val response = authService.changePassword(authHeader, request)
        return ResponseEntity.ok(response)
    }
    
    @PostMapping("/change-pin")
    fun changePin(
        @RequestHeader("Authorization") authHeader: String,
        @RequestBody request: ChangePinRequest
    ): ResponseEntity<ApiResponse<String>> {
        val response = authService.changePin(authHeader, request)
        return ResponseEntity.ok(response)
    }
    
    @GetMapping("/inquiry/{accountNumber}")
    fun accountInquiry(@PathVariable accountNumber: String): ResponseEntity<ApiResponse<CustomerInquiryResponse>> {
        val response = authService.getCustomerByAccountNumber(accountNumber)
        return ResponseEntity.ok(response)
    }
}