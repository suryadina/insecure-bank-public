package com.insecurebank.auth.service

import com.insecurebank.auth.model.Customer
import com.insecurebank.auth.model.Device
import com.insecurebank.auth.repository.CustomerRepository
import com.insecurebank.auth.repository.DeviceRepository
import org.springframework.boot.CommandLineRunner
import org.springframework.stereotype.Component
import org.springframework.transaction.annotation.Transactional
import java.time.LocalDate
import java.time.LocalDateTime

// Disabled DataSeeder - using SQL initialization instead
//@Component
class DataSeeder(
    private val customerRepository: CustomerRepository,
    private val deviceRepository: DeviceRepository
) : CommandLineRunner {

    override fun run(vararg args: String?) {
        println("🔧 DataSeeder disabled - using SQL initialization")
    }

    @Transactional
    private fun seedCustomers() {
        try {
            println("🏦 Creating customer data...")
            val customers = listOf(
            Customer(
                phoneNumber = "+628123456789",
                ktpNumber = "3174010101850001",
                fullName = "Ahmad Rizki",
                dateOfBirth = LocalDate.of(1985, 1, 1),
                selfiePath = "/uploads/selfie1.jpg",
                password = "password123",
                isVerified = true,
                createdAt = LocalDateTime.now().minusDays(30),
                updatedAt = LocalDateTime.now().minusDays(30)
            ),
            Customer(
                phoneNumber = "+628123456790",
                ktpNumber = "3174010201900002",
                fullName = "Siti Nurhaliza",
                dateOfBirth = LocalDate.of(1990, 2, 15),
                selfiePath = "/uploads/selfie2.jpg",
                password = "siti123",
                isVerified = true,
                createdAt = LocalDateTime.now().minusDays(25),
                updatedAt = LocalDateTime.now().minusDays(25)
            ),
            Customer(
                phoneNumber = "+628123456791",
                ktpNumber = "3174010301950003",
                fullName = "Budi Santoso",
                dateOfBirth = LocalDate.of(1995, 3, 20),
                selfiePath = "/uploads/selfie3.jpg",
                password = "budi2023",
                isVerified = true,
                createdAt = LocalDateTime.now().minusDays(20),
                updatedAt = LocalDateTime.now().minusDays(20)
            ),
            Customer(
                phoneNumber = "+628123456792",
                ktpNumber = "3174010401880004",
                fullName = "Dewi Kartika",
                dateOfBirth = LocalDate.of(1988, 4, 10),
                selfiePath = "/uploads/selfie4.jpg",
                password = "dewi456",
                isVerified = true,
                createdAt = LocalDateTime.now().minusDays(15),
                updatedAt = LocalDateTime.now().minusDays(15)
            ),
            Customer(
                phoneNumber = "+628123456793",
                ktpNumber = "3174010501920005",
                fullName = "Eko Prasetyo",
                dateOfBirth = LocalDate.of(1992, 5, 25),
                selfiePath = "/uploads/selfie5.jpg",
                password = "eko789",
                isVerified = true,
                createdAt = LocalDateTime.now().minusDays(10),
                updatedAt = LocalDateTime.now().minusDays(10)
            ),
            Customer(
                phoneNumber = "+628123456794",
                ktpNumber = "3174010601870006",
                fullName = "Fitri Handayani",
                dateOfBirth = LocalDate.of(1987, 6, 12),
                selfiePath = "/uploads/selfie6.jpg",
                password = "fitri321",
                isVerified = true,
                createdAt = LocalDateTime.now().minusDays(8),
                updatedAt = LocalDateTime.now().minusDays(8)
            ),
            Customer(
                phoneNumber = "+628123456795",
                ktpNumber = "3174010701940007",
                fullName = "Gunawan Tjandra",
                dateOfBirth = LocalDate.of(1994, 7, 8),
                selfiePath = "/uploads/selfie7.jpg",
                password = "gunawan88",
                isVerified = true,
                createdAt = LocalDateTime.now().minusDays(5),
                updatedAt = LocalDateTime.now().minusDays(5)
            ),
            Customer(
                phoneNumber = "+628123456796",
                ktpNumber = "3174010801910008",
                fullName = "Hesti Purnamasari",
                dateOfBirth = LocalDate.of(1991, 8, 30),
                selfiePath = "/uploads/selfie8.jpg",
                password = "hesti2024",
                isVerified = true,
                createdAt = LocalDateTime.now().minusDays(3),
                updatedAt = LocalDateTime.now().minusDays(3)
            ),
            Customer(
                phoneNumber = "+628123456797",
                ktpNumber = "3174010901890009",
                fullName = "Irwan Setiawan",
                dateOfBirth = LocalDate.of(1989, 9, 18),
                selfiePath = "/uploads/selfie9.jpg",
                password = "irwan555",
                isVerified = true,
                createdAt = LocalDateTime.now().minusDays(2),
                updatedAt = LocalDateTime.now().minusDays(2)
            ),
            Customer(
                phoneNumber = "+628123456798",
                ktpNumber = "3174011001930010",
                fullName = "Jessica Tanoesoedibjo",
                dateOfBirth = LocalDate.of(1993, 10, 5),
                selfiePath = "/uploads/selfie10.jpg",
                password = "jessica777",
                isVerified = true,
                createdAt = LocalDateTime.now().minusDays(1),
                updatedAt = LocalDateTime.now().minusDays(1)
            )
        )

            customerRepository.saveAll(customers)
            println("✅ Seeded ${customers.size} customers")
        } catch (e: Exception) {
            println("❌ Error seeding customers: ${e.message}")
            e.printStackTrace()
        }
    }

    @Transactional
    private fun seedDevices() {
        try {
            println("📱 Creating device data...")
            val customers = customerRepository.findAll()
            val devices = mutableListOf<Device>()

        customers.forEachIndexed { index, customer ->
            // Each customer gets 1-2 devices
            val deviceCount = if (index % 3 == 0) 2 else 1
            
            repeat(deviceCount) { deviceIndex ->
                val deviceTypes = listOf("iPhone 14", "Samsung Galaxy S23", "Xiaomi Mi 12", "Google Pixel 7")
                val device = Device(
                    deviceId = "DEV${customer.id}${deviceIndex + 1}${System.currentTimeMillis() % 1000}",
                    customerId = customer.id,
                    deviceName = "${deviceTypes[index % deviceTypes.size]} ${if (deviceCount > 1) "- Device ${deviceIndex + 1}" else ""}",
                    isActive = true,
                    enrolledAt = customer.createdAt.plusHours(1),
                    lastLoginAt = LocalDateTime.now().minusDays((index + 1).toLong())
                )
                devices.add(device)
            }
        }

            deviceRepository.saveAll(devices)
            println("✅ Seeded ${devices.size} devices")
        } catch (e: Exception) {
            println("❌ Error seeding devices: ${e.message}")
            e.printStackTrace()
        }
    }
}