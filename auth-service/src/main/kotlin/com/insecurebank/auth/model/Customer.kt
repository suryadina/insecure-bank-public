package com.insecurebank.auth.model

import jakarta.persistence.*
import java.time.LocalDate
import java.time.LocalDateTime

@Entity
@Table(name = "customers")
data class Customer(
    @Id
    val id: String = "",
    
    @Column(nullable = false)
    val phoneNumber: String = "",
    
    @Column(nullable = false)
    val ktpNumber: String = "",
    
    @Column(nullable = false)
    val fullName: String = "",
    
    @Column(nullable = false)
    val dateOfBirth: LocalDate = LocalDate.now(),
    
    @Column(nullable = true)
    val selfiePath: String? = null,
    
    @Column(nullable = true)
    val password: String? = null,
    
    // Vulnerable: Store PIN in plain text
    @Column(nullable = true)
    val pin: String? = null,
    
    @Column(nullable = false)
    val isVerified: Boolean = false,
    
    @Column(nullable = false)
    val createdAt: LocalDateTime = LocalDateTime.now(),
    
    @Column(nullable = false)
    val updatedAt: LocalDateTime = LocalDateTime.now()
)