package com.insecurebank.auth.repository

import com.insecurebank.auth.model.Customer
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.stereotype.Repository

@Repository
interface CustomerRepository : JpaRepository<Customer, String> {
    fun findByPhoneNumber(phoneNumber: String): Customer?
    fun findByKtpNumber(ktpNumber: String): Customer?
}