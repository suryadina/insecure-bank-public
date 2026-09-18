package com.insecurebank.game.config;

import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.boot.autoconfigure.jdbc.DataSourceProperties;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;
import org.springframework.jdbc.core.JdbcTemplate;

import javax.sql.DataSource;

/**
 * Two independent DataSources on purpose:
 *  - "game" (primary, JPA-backed): game-service's own game_mfa schema.
 *  - "bank": read-only-in-practice connection to the bank's existing auth_db
 *    schema, used only to validate shared credentials. Kept separate so the
 *    MFA store never lives alongside the bank's customer data.
 */
@Configuration
public class DataSourceConfig {

    @Primary
    @Bean
    @ConfigurationProperties("spring.datasource")
    public DataSourceProperties gameDataSourceProperties() {
        return new DataSourceProperties();
    }

    @Primary
    @Bean
    public DataSource gameDataSource(@Qualifier("gameDataSourceProperties") DataSourceProperties gameDataSourceProperties) {
        return gameDataSourceProperties.initializeDataSourceBuilder().build();
    }

    @Bean
    @ConfigurationProperties("bank.datasource")
    public DataSourceProperties bankDataSourceProperties() {
        return new DataSourceProperties();
    }

    @Bean
    public DataSource bankDataSource(@Qualifier("bankDataSourceProperties") DataSourceProperties bankDataSourceProperties) {
        return bankDataSourceProperties.initializeDataSourceBuilder().build();
    }

    @Bean
    public JdbcTemplate bankJdbcTemplate(@Qualifier("bankDataSource") DataSource bankDataSource) {
        return new JdbcTemplate(bankDataSource);
    }
}
