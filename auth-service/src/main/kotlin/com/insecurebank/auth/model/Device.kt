package com.insecurebank.auth.model

import jakarta.persistence.*
import java.time.LocalDateTime

@Entity
@Table(name = "devices")
data class Device(
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    val id: Long = 0,
    
    @Column(nullable = false)
    val deviceId: String = "",
    
    @Column(nullable = false)
    val customerId: String = "",
    
    @Column(nullable = false)
    val deviceName: String = "",
    
    @Column(nullable = false)
    val isActive: Boolean = true,
    
    @Column(nullable = false)
    val enrolledAt: LocalDateTime = LocalDateTime.now(),
    
    @Column(nullable = false)
    val lastLoginAt: LocalDateTime? = null
)