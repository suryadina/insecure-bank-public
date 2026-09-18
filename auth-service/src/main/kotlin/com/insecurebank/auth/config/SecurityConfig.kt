package com.insecurebank.auth.config

import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Configuration
import org.springframework.security.config.annotation.web.builders.HttpSecurity
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity
import org.springframework.security.web.SecurityFilterChain

@Configuration
@EnableWebSecurity
class SecurityConfig {
    
    @Bean
    fun filterChain(http: HttpSecurity): SecurityFilterChain {
        http
            .csrf { it.disable() } // Vulnerable: CSRF protection disabled
            .authorizeHttpRequests { authz ->
                authz.anyRequest().permitAll() // Vulnerable: All endpoints are public
            }
            .headers { headers ->
                headers.frameOptions().disable() // Vulnerable: X-Frame-Options disabled
            }
        
        return http.build()
    }
}