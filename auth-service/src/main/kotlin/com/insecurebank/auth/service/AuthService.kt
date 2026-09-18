package com.insecurebank.auth.service

import com.insecurebank.auth.dto.*
import com.insecurebank.auth.model.Customer
import com.insecurebank.auth.model.Device
import com.insecurebank.auth.repository.CustomerRepository
import com.insecurebank.auth.repository.DeviceRepository
import com.insecurebank.auth.util.JwtUtil
import com.insecurebank.auth.util.HashUtil
import org.springframework.stereotype.Service
import java.time.LocalDateTime
import java.util.*

@Service
class AuthService(
    private val customerRepository: CustomerRepository,
    private val deviceRepository: DeviceRepository,
    private val otpService: OtpService,
    private val jwtUtil: JwtUtil,
    private val transactionServiceClient: TransactionServiceClient
) {
    // Shared HTTP client for outbound calls to transaction-service. A fresh
    // per-request HttpClient spawns HttpClient-Worker threads that are never
    // reaped, exhausting the process under student inquiry load (caused the
    // "unable to create native thread" hang / 504s on /api/auth/inquiry).
    // This preserves the same requests/responses while sharing one client.
    private val httpClient: java.net.http.HttpClient = java.net.http.HttpClient.newBuilder().build()
    
    fun registerCustomer(request: RegistrationRequest): ApiResponse<RegistrationResponse> {
        // Check if phone number already exists
        val existingCustomer = customerRepository.findByPhoneNumber(request.phoneNumber)
        if (existingCustomer != null) {
            return ApiResponse(false, "Phone number already registered")
        }
        
        // Check if KTP already exists (vulnerable: should hash KTP)
        val existingKtp = customerRepository.findByKtpNumber(request.ktpNumber)
        if (existingKtp != null) {
            return ApiResponse(false, "KTP number already registered")
        }
        
        // Save customer data
        val customer = Customer(
            id = UUID.randomUUID().toString(),
            phoneNumber = request.phoneNumber,
            ktpNumber = request.ktpNumber, // Vulnerable: storing plain text KTP
            fullName = request.fullName,
            dateOfBirth = request.dateOfBirth,
            selfiePath = request.selfiePath
        )
        
        customerRepository.save(customer)
        
        // Generate OTP for verification - VULNERABLE: capture OTP to leak in response
        val generatedOtp = otpService.generateOtp(request.phoneNumber, "REGISTRATION")
        
        val responseData = RegistrationResponse(
            phoneNumber = request.phoneNumber,
            otp = generatedOtp // VULNERABLE: Leak OTP in response for CTF accessibility
        )
        
        return ApiResponse(true, "Registration successful. Please verify OTP.", responseData)
    }
    
    fun verifyRegistrationOtp(request: OtpVerificationRequest): ApiResponse<String> {
        val isValid = otpService.verifyOtp(request.phoneNumber, request.otpCode, "REGISTRATION")
        
        if (!isValid) {
            return ApiResponse(false, "Invalid or expired OTP")
        }
        
        return ApiResponse(true, "OTP verified successfully. Please set password.")
    }
    
    fun setPassword(request: SetPasswordRequest): ApiResponse<String> {
        val customer = customerRepository.findByPhoneNumber(request.phoneNumber)
            ?: return ApiResponse(false, "Customer not found")
        
        // Check if password is already set
        if (!customer.password.isNullOrEmpty()) {
            return ApiResponse(false, "Password already set. Use password reset if you need to change it.")
        }
        
        // Vulnerable: Store password using weak SHA1 hashing without salt
        val hashedPassword = HashUtil.sha1Hash(request.password)
        val updatedCustomer = customer.copy(
            password = hashedPassword, // Vulnerable: weak SHA1 hashing
            isVerified = true,
            updatedAt = LocalDateTime.now()
        )
        
        customerRepository.save(updatedCustomer)
        
        return ApiResponse(true, "Password set successfully. Please set your transaction PIN.")
    }
    
    fun setPin(request: SetPinRequest): ApiResponse<String> {
        val customer = customerRepository.findByPhoneNumber(request.phoneNumber)
            ?: return ApiResponse(false, "Customer not found")
        
        if (!customer.isVerified) {
            return ApiResponse(false, "Customer account not verified")
        }
        
        // Check if PIN is already set
        if (!customer.pin.isNullOrEmpty()) {
            return ApiResponse(false, "PIN already set. Contact customer service to reset your PIN.")
        }
        
        // Vulnerable: Store PIN using weak SHA1 hashing without salt
        val hashedPin = HashUtil.sha1Hash(request.pin)
        val updatedCustomer = customer.copy(
            pin = hashedPin, // Vulnerable: weak SHA1 hashing
            updatedAt = LocalDateTime.now()
        )
        
        customerRepository.save(updatedCustomer)
        
        // Create savings account with welcome bonus after PIN is set
        val accountCreated = try {
            transactionServiceClient.createSavingsAccountWithBonus(customer.id)
        } catch (e: Exception) {
            println("⚠️ Failed to create account with bonus for customer ${customer.id}: ${e.message}")
            false
        }
        
        val message = if (accountCreated) {
            "PIN set successfully! A savings account has been created with a welcome bonus of IDR 999,999. You can now enroll devices."
        } else {
            "PIN set successfully. You can now enroll devices. (Account creation with bonus failed - please contact customer service)"
        }
        
        return ApiResponse(true, message)
    }
    
    fun validatePin(request: ValidatePinRequest): ApiResponse<Boolean> {
        try {
            val customer = customerRepository.findById(request.customerId).orElse(null)
                ?: return ApiResponse(false, "Customer not found")
            
            // Vulnerable: SHA1 PIN comparison without salt
            val hashedPin = HashUtil.sha1Hash(request.pin)
            val pinValid = customer.pin == hashedPin
            
            return if (pinValid) {
                ApiResponse(true, "PIN valid", true)
            } else {
                ApiResponse(false, "Invalid PIN", false)
            }
        } catch (e: Exception) {
            return ApiResponse(false, "PIN validation failed", false)
        }
    }
    
    fun enrollDevice(request: DeviceEnrollmentRequest): ApiResponse<DeviceEnrollmentResponse> {
        val customer = customerRepository.findByPhoneNumber(request.phoneNumber)
            ?: return ApiResponse(false, "Customer not found")
        
        // Check if password is set
        if (customer.password.isNullOrEmpty()) {
            return ApiResponse(false, "Password not set. Please complete registration first.")
        }
        
        // Vulnerable: SHA1 password comparison without salt
        val hashedPassword = HashUtil.sha1Hash(request.password)
        if (customer.password != hashedPassword) {
            return ApiResponse(false, "Invalid password")
        }
        
        if (!customer.isVerified) {
            return ApiResponse(false, "Customer account not verified")
        }
        
        if (customer.pin.isNullOrEmpty()) {
            return ApiResponse(false, "Please set your transaction PIN first")
        }
        
        // Check if device already enrolled for this customer (hash device ID for comparison)
        val hashedDeviceId = HashUtil.sha1Hash(request.deviceId)
        val existingDevice = deviceRepository.findByDeviceIdAndCustomerId(hashedDeviceId, customer.id)
        if (existingDevice != null) {
            return ApiResponse(false, "Device already enrolled for this account")
        }
        
        // Generate OTP for device enrollment - VULNERABLE: capture OTP to leak in response
        val generatedOtp = otpService.generateOtp(request.phoneNumber, "DEVICE_ENROLLMENT")
        
        val responseData = DeviceEnrollmentResponse(
            message = "OTP sent for device enrollment verification",
            otp = generatedOtp // VULNERABLE: Leak OTP in response for CTF accessibility
        )
        
        return ApiResponse(true, "OTP sent for device enrollment verification", responseData)
    }
    
    fun verifyDeviceEnrollment(phoneNumber: String, otpCode: String, request: DeviceEnrollmentRequest): ApiResponse<AuthResponse> {
        val isValid = otpService.verifyOtp(phoneNumber, otpCode, "DEVICE_ENROLLMENT")
        
        if (!isValid) {
            return ApiResponse(false, "Invalid or expired OTP")
        }
        
        val customer = customerRepository.findByPhoneNumber(request.phoneNumber)
            ?: return ApiResponse(false, "Customer not found")
        
        // Save device with hashed device ID (vulnerable: weak SHA1 hashing)
        val hashedDeviceId = HashUtil.sha1Hash(request.deviceId)
        val device = Device(
            deviceId = hashedDeviceId, // Vulnerable: weak SHA1 hashing
            customerId = customer.id,
            deviceName = request.deviceName,
            enrolledAt = LocalDateTime.now(),
            lastLoginAt = LocalDateTime.now()
        )
        
        deviceRepository.save(device)
        
        // Generate access token
        val accessToken = jwtUtil.generateToken(customer.id, request.deviceId)
        
        val authResponse = AuthResponse(
            accessToken = accessToken,
            customerId = customer.id,
            deviceId = request.deviceId
        )
        
        return ApiResponse(true, "Device enrolled successfully", authResponse)
    }
    
    fun loginWithDevice(request: LoginRequest): ApiResponse<AuthResponse> {
        val customer = customerRepository.findByPhoneNumber(request.phoneNumber)
            ?: return ApiResponse(false, "Customer not found")
        
        // Check if password is set
        if (customer.password.isNullOrEmpty()) {
            return ApiResponse(false, "Password not set. Please complete registration first.")
        }
        
        // Vulnerable: SHA1 password comparison without salt
        val hashedPassword = HashUtil.sha1Hash(request.password)
        if (customer.password != hashedPassword) {
            return ApiResponse(false, "Invalid password")
        }
        
        // Hash device ID for lookup
        val hashedDeviceId = HashUtil.sha1Hash(request.deviceId)
        val device = deviceRepository.findByDeviceIdAndCustomerId(hashedDeviceId, customer.id)
            ?: return ApiResponse(false, "Device not found or not enrolled for this account")
        
        if (!device.isActive) {
            return ApiResponse(false, "Device is deactivated")
        }
        
        // Update last login time
        val updatedDevice = device.copy(lastLoginAt = LocalDateTime.now())
        deviceRepository.save(updatedDevice)
        
        // Generate access token
        val accessToken = jwtUtil.generateToken(customer.id, request.deviceId)
        
        val authResponse = AuthResponse(
            accessToken = accessToken,
            customerId = customer.id,
            deviceId = request.deviceId
        )
        
        return ApiResponse(true, "Login successful", authResponse)
    }
    
    fun forgotPassword(request: ForgotPasswordRequest): ApiResponse<String> {
        val customer = customerRepository.findByPhoneNumber(request.phoneNumber)
            ?: return ApiResponse(false, "Customer not found")
        
        // Generate OTP for password reset
        otpService.generateOtp(customer.phoneNumber, "PASSWORD_RESET")
        
        return ApiResponse(true, "OTP sent for password reset verification")
    }
    
    fun resetPassword(request: ResetPasswordRequest): ApiResponse<String> {
        val isValid = otpService.verifyOtp(request.phoneNumber, request.otpCode, "PASSWORD_RESET")
        
        if (!isValid) {
            return ApiResponse(false, "Invalid or expired OTP")
        }
        
        val customer = customerRepository.findByPhoneNumber(request.phoneNumber)
            ?: return ApiResponse(false, "Customer not found")
        
        // Vulnerable: Store plain text password
        val updatedCustomer = customer.copy(
            password = request.newPassword,
            updatedAt = LocalDateTime.now()
        )
        
        customerRepository.save(updatedCustomer)
        
        return ApiResponse(true, "Password reset successfully")
    }
    
    fun getCustomerProfile(authHeader: String): ApiResponse<Customer> {
        try {
            // Extract token from Authorization header
            val token = authHeader.replace("Bearer ", "")
            
            if (!jwtUtil.validateToken(token)) {
                return ApiResponse(false, "Invalid or expired token")
            }
            
            val customerId = jwtUtil.getCustomerIdFromToken(token)
            val customer = customerRepository.findById(customerId).orElse(null)
                ?: return ApiResponse(false, "Customer not found")
            
            return ApiResponse(true, "Profile retrieved successfully", customer)
        } catch (e: Exception) {
            return ApiResponse(false, "Failed to retrieve profile")
        }
    }
    
    fun getCustomerByAccountNumber(accountNumber: String): ApiResponse<CustomerInquiryResponse> {
        try {
            // Check if input looks like a phone number (starts with + and contains digits)
            if (accountNumber.startsWith("+") && accountNumber.length > 10) {
                return getCustomerByPhoneNumber(accountNumber)
            }
            
            // Make HTTP call to transaction service to get account details
            val transactionServiceUrl = "http://transaction-service:8081"
            val url = "$transactionServiceUrl/api/transactions/inquiry/$accountNumber"
            
            // Use the shared HTTP client (avoids leaking a client per request)
            val request = java.net.http.HttpRequest.newBuilder()
                .uri(java.net.URI.create(url))
                .GET()
                .build()
            
            val response = httpClient.send(request, java.net.http.HttpResponse.BodyHandlers.ofString())
            
            if (response.statusCode() == 200) {
                // Parse response to get customer ID
                val responseBody = response.body()
                val gson = com.google.gson.Gson()
                val apiResponse = gson.fromJson(responseBody, Map::class.java) as Map<String, Any>
                
                if (apiResponse["success"] == true) {
                    val accountData = apiResponse["data"] as Map<String, Any>
                    val customerId = accountData["customerId"] as String
                    
                    // Get customer details from auth database
                    val customer = customerRepository.findById(customerId).orElse(null)
                        ?: return ApiResponse(false, "Customer not found")
                    
                    // Handle isActive field - can be Boolean, Number, or String
                    val isActiveValue = when (val active = accountData["isActive"]) {
                        is Boolean -> active
                        is Number -> active.toInt() == 1
                        is String -> active.equals("true", ignoreCase = true) || active == "1"
                        else -> false
                    }
                    
                    // Vulnerable: Return excessive data including sensitive information
                    val inquiryResponse = CustomerInquiryResponse(
                        customerId = customerId,
                        customerName = customer.fullName,
                        accountNumber = accountData["accountNumber"] as String,
                        accountType = accountData["accountType"] as String,
                        isActive = isActiveValue,
                        // Excessive data that frontend doesn't need:
                        phoneNumber = customer.phoneNumber,
                        ktpNumber = customer.ktpNumber, // Very sensitive!
                        dateOfBirth = customer.dateOfBirth.toString(),
                        isVerified = customer.isVerified,
                        createdAt = customer.createdAt.toString(),
                        updatedAt = customer.updatedAt?.toString()
                    )
                    
                    return ApiResponse(true, "Account inquiry successful", inquiryResponse)
                } else {
                    return ApiResponse(false, apiResponse["message"] as String? ?: "Account not found")
                }
            } else {
                return ApiResponse(false, "Account not found")
            }
            
        } catch (e: Exception) {
            return ApiResponse(false, "Failed to inquire account: ${e.message}")
        }
    }
    
    private fun getCustomerByPhoneNumber(phoneNumber: String): ApiResponse<CustomerInquiryResponse> {
        try {
            // Vulnerable: Direct phone number lookup exposes customer data
            val customer = customerRepository.findByPhoneNumber(phoneNumber)
                ?: return ApiResponse(false, "Customer not found")
            
            // Get customer's first account from transaction service
            val transactionServiceUrl = "http://transaction-service:8081"
            val url = "$transactionServiceUrl/api/transactions/customer/${customer.id}/accounts"
            
            // Use the shared HTTP client (avoids leaking a client per request)
            val serviceApiKey = System.getenv("SERVICE_API_KEY") ?: "InternalServiceKey123VulnerableForWorkshop"
            val request = java.net.http.HttpRequest.newBuilder()
                .uri(java.net.URI.create(url))
                .header("X-Service-API-Key", serviceApiKey)
                .GET()
                .build()
            
            val response = httpClient.send(request, java.net.http.HttpResponse.BodyHandlers.ofString())
            
            if (response.statusCode() == 200) {
                val responseBody = response.body()
                val gson = com.google.gson.Gson()
                val apiResponse = gson.fromJson(responseBody, Map::class.java) as Map<String, Any>
                
                if (apiResponse["success"] == true) {
                    val accounts = apiResponse["data"] as List<Map<String, Any>>
                    
                    // Get first account (all returned accounts belong to this customer)
                    val customerAccount = accounts.firstOrNull() 
                        ?: return ApiResponse(false, "No account found for this customer")
                    
                    // Handle isActive field (transaction service uses snake_case)
                    val isActiveValue = when (val active = customerAccount["is_active"]) {
                        is Boolean -> active
                        is Number -> active.toInt() == 1
                        is String -> active.equals("true", ignoreCase = true) || active == "1"
                        else -> false
                    }
                    
                    // Extract account fields (transaction service uses snake_case)
                    val accountNumber = customerAccount["account_number"]?.toString() 
                        ?: return ApiResponse(false, "Account number not found")
                    val accountType = customerAccount["account_type"]?.toString() 
                        ?: "UNKNOWN"
                    
                    // Vulnerable: Return excessive data including sensitive information from phone lookup
                    val inquiryResponse = CustomerInquiryResponse(
                        customerId = customer.id,
                        customerName = customer.fullName,
                        accountNumber = accountNumber,
                        accountType = accountType,
                        isActive = isActiveValue,
                        // Excessive data exposed through phone number search:
                        phoneNumber = customer.phoneNumber,
                        ktpNumber = customer.ktpNumber, // Very sensitive!
                        dateOfBirth = customer.dateOfBirth.toString(),
                        isVerified = customer.isVerified,
                        createdAt = customer.createdAt.toString(),
                        updatedAt = customer.updatedAt?.toString()
                    )
                    
                    return ApiResponse(true, "Account inquiry by phone successful", inquiryResponse)
                }
            }
            
            return ApiResponse(false, "Failed to retrieve account information")
            
        } catch (e: Exception) {
            return ApiResponse(false, "Failed to inquire by phone number: ${e.message}")
        }
    }
    
    fun changePassword(authHeader: String, request: ChangePasswordRequest): ApiResponse<String> {
        try {
            // Extract token from Authorization header
            val token = authHeader.replace("Bearer ", "")
            
            if (!jwtUtil.validateToken(token)) {
                return ApiResponse(false, "Invalid or expired token")
            }
            
            val customerId = jwtUtil.getCustomerIdFromToken(token)
            val customer = customerRepository.findById(customerId).orElse(null)
                ?: return ApiResponse(false, "Customer not found")
            
            // Verify current password
            val currentPasswordHash = HashUtil.sha1Hash(request.currentPassword)
            if (customer.password != currentPasswordHash) {
                return ApiResponse(false, "Current password is incorrect")
            }
            
            // Update to new password
            val newPasswordHash = HashUtil.sha1Hash(request.newPassword)
            val updatedCustomer = customer.copy(
                password = newPasswordHash,
                updatedAt = LocalDateTime.now()
            )
            
            customerRepository.save(updatedCustomer)
            
            return ApiResponse(true, "Password changed successfully")
        } catch (e: Exception) {
            return ApiResponse(false, "Failed to change password")
        }
    }
    
    fun changePin(authHeader: String, request: ChangePinRequest): ApiResponse<String> {
        try {
            // Extract token from Authorization header
            val token = authHeader.replace("Bearer ", "")
            
            if (!jwtUtil.validateToken(token)) {
                return ApiResponse(false, "Invalid or expired token")
            }
            
            val customerId = jwtUtil.getCustomerIdFromToken(token)
            val customer = customerRepository.findById(customerId).orElse(null)
                ?: return ApiResponse(false, "Customer not found")
            
            // Check if PIN is set
            if (customer.pin.isNullOrEmpty()) {
                return ApiResponse(false, "PIN not set. Please set PIN first.")
            }
            
            // Verify current PIN
            val currentPinHash = HashUtil.sha1Hash(request.currentPin)
            if (customer.pin != currentPinHash) {
                return ApiResponse(false, "Current PIN is incorrect")
            }
            
            // Update to new PIN
            val newPinHash = HashUtil.sha1Hash(request.newPin)
            val updatedCustomer = customer.copy(
                pin = newPinHash,
                updatedAt = LocalDateTime.now()
            )
            
            customerRepository.save(updatedCustomer)
            
            return ApiResponse(true, "PIN changed successfully")
        } catch (e: Exception) {
            return ApiResponse(false, "Failed to change PIN")
        }
    }
}