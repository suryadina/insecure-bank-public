package com.insecurebank.auth.service

import com.insecurebank.auth.dto.*
import com.insecurebank.auth.util.JwtUtil
import org.springframework.stereotype.Service
import org.springframework.web.reactive.function.client.WebClient
import org.springframework.http.HttpHeaders
import org.springframework.http.MediaType
import reactor.core.publisher.Mono
import java.time.Duration

@Service
class TransactionServiceClient(
    private val jwtUtil: JwtUtil
) {
    
    // Using internal Docker network hostname for service-to-service communication
    private val transactionServiceUrl = "http://transaction-service:8081"
    
    private val webClient = WebClient.builder()
        .baseUrl(transactionServiceUrl)
        .defaultHeader(HttpHeaders.CONTENT_TYPE, MediaType.APPLICATION_JSON_VALUE)
        .build()
    
    fun createSavingsAccountWithBonus(customerId: String): Boolean {
        return try {
            // Generate JWT token for the customer to authenticate with transaction service
            val token = jwtUtil.generateToken(customerId, "temp-device")
            
            // Step 1: Create savings account
            val createAccountRequest = CreateAccountRequest(account_type = "SAVINGS")
            
            val accountResponse = webClient.post()
                .uri("/api/transactions/accounts")
                .header(HttpHeaders.AUTHORIZATION, "Bearer $token")
                .bodyValue(createAccountRequest)
                .retrieve()
                .bodyToMono(CreateAccountResponse::class.java)
                .timeout(Duration.ofSeconds(10))
                .block()
            
            if (accountResponse?.success == true && accountResponse.data != null) {
                val accountNumber = accountResponse.data.account_number
                
                // Step 2: Add bonus deposit of IDR 999,999
                val depositRequest = DepositRequest(
                    account_number = accountNumber,
                    amount = 999999.0,
                    description = "Welcome bonus for new customer registration"
                )
                
                val depositResponse = webClient.post()
                    .uri("/api/transactions/deposit")
                    .bodyValue(depositRequest)  // Deposit endpoint doesn't require auth (vulnerability)
                    .retrieve()
                    .bodyToMono(DepositResponse::class.java)
                    .timeout(Duration.ofSeconds(10))
                    .block()
                
                if (depositResponse?.success == true) {
                    println("✅ Successfully created account $accountNumber with IDR 999,999 bonus for customer $customerId")
                    return true
                } else {
                    println("❌ Failed to add bonus to account $accountNumber: ${depositResponse?.message}")
                    return false
                }
            } else {
                println("❌ Failed to create savings account for customer $customerId: ${accountResponse?.message}")
                return false
            }
        } catch (e: Exception) {
            println("❌ Error creating account with bonus for customer $customerId: ${e.message}")
            e.printStackTrace()
            return false
        }
    }
}