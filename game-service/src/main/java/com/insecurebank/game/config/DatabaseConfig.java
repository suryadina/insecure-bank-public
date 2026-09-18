package com.insecurebank.game.config;

import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Component;

import javax.sql.DataSource;
import java.sql.SQLException;

@Component
public class DatabaseConfig {

    private final DataSource gameDataSource;
    private final DataSource bankDataSource;

    public DatabaseConfig(@Qualifier("gameDataSource") DataSource gameDataSource,
                           @Qualifier("bankDataSource") DataSource bankDataSource) {
        this.gameDataSource = gameDataSource;
        this.bankDataSource = bankDataSource;
    }

    @EventListener(ApplicationReadyEvent.class)
    public void verifyDatabaseConnections() {
        verify("game_mfa", gameDataSource);
        verify("auth_db (shared bank credentials)", bankDataSource);
    }

    private void verify(String label, DataSource dataSource) {
        int retryCount = 0;
        int maxRetries = 30;

        System.out.println("Verifying PostgreSQL connection for schema: " + label);

        while (retryCount < maxRetries) {
            try (var connection = dataSource.getConnection();
                 var statement = connection.createStatement();
                 var resultSet = statement.executeQuery("SELECT 1")) {
                if (resultSet.next()) {
                    System.out.println("Connection verified for schema: " + label);
                    return;
                }
            } catch (SQLException e) {
                retryCount++;
                System.out.println("Database connection failed for " + label + " (attempt " + retryCount + "/" + maxRetries + "): " + e.getMessage());
                if (retryCount < maxRetries) {
                    try {
                        Thread.sleep(5000);
                    } catch (InterruptedException ie) {
                        Thread.currentThread().interrupt();
                        return;
                    }
                } else {
                    throw new RuntimeException("Failed to connect to PostgreSQL schema " + label + " after " + maxRetries + " attempts", e);
                }
            }
        }
    }
}
