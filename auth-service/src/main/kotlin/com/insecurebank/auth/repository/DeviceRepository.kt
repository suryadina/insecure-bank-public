package com.insecurebank.auth.repository

import com.insecurebank.auth.model.Device
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.stereotype.Repository

@Repository
interface DeviceRepository : JpaRepository<Device, Long> {
    fun findByDeviceId(deviceId: String): Device?
    fun findByCustomerId(customerId: String): List<Device>
    fun findByDeviceIdAndCustomerId(deviceId: String, customerId: String): Device?
}