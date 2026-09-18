package com.insecurebank.auth.config

import org.springframework.boot.context.event.ApplicationReadyEvent
import org.springframework.context.event.EventListener
import org.springframework.stereotype.Component
import javax.sql.DataSource
import java.sql.SQLException

@Component
class DatabaseConfig(
    private val dataSource: DataSource
) {
    
    @EventListener(ApplicationReadyEvent::class)
    fun verifyDatabaseConnection() {
        var retryCount = 0
        val maxRetries = 30
        
        println("🔍 Verifying PostgreSQL database connection for auth service...")
        
        while (retryCount < maxRetries) {
            try {
                dataSource.connection.use { connection ->
                    connection.createStatement().use { statement ->
                        statement.executeQuery("SELECT 1").use { resultSet ->
                            if (resultSet.next()) {
                                println("✅ Auth service PostgreSQL database connection verified")
                                println("📊 Connected to schema: auth_db")
                                return
                            }
                        }
                    }
                }
            } catch (e: SQLException) {
                retryCount++
                println("❌ Database connection failed (attempt $retryCount/$maxRetries): ${e.message}")
                
                if (retryCount < maxRetries) {
                    println("🔄 Retrying database connection in 5 seconds...")
                    Thread.sleep(5000)
                } else {
                    println("❌ Max database connection retries reached for auth service")
                    throw RuntimeException("Failed to connect to PostgreSQL database after $maxRetries attempts", e)
                }
            }
        }
    }
}