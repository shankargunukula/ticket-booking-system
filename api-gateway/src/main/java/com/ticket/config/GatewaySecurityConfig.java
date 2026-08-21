package com.ticket.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.reactive.EnableWebFluxSecurity;
import org.springframework.security.config.web.server.ServerHttpSecurity;
import org.springframework.security.oauth2.client.registration.ReactiveClientRegistrationRepository;
import org.springframework.security.web.server.SecurityWebFilterChain;
import reactor.core.publisher.Mono;

@Configuration
@EnableWebFluxSecurity
public class GatewaySecurityConfig {

    /**
     * 🚀 FIXED: Injects an inactive runtime repository stub.
     * This satisfies the background Spring framework classpath check and completely eliminates
     * the "clientRegistrationRepository cannot be null" initialization crash.
     */
    @Bean
    public ReactiveClientRegistrationRepository reactiveClientRegistrationRepository() {
        return id -> Mono.empty();
    }

    @Bean
    public SecurityWebFilterChain securityWebFilterChain(ServerHttpSecurity http) {
        return http
                // 1. Disable CSRF since microservices are completely stateless (JWT driven)
                .csrf(ServerHttpSecurity.CsrfSpec::disable)

                // 2. Disable default session-based form login screens and pop-up dialog boxes
                .formLogin(ServerHttpSecurity.FormLoginSpec::disable)
                .httpBasic(ServerHttpSecurity.HttpBasicSpec::disable)

                // 3. Configure endpoint filters to allow public routes and let custom filters handle security
                .authorizeExchange(exchanges -> exchanges
                        .pathMatchers("/api/v1/auth/**", "/api/v1/otp/**").permitAll()
                        .anyExchange().permitAll()
                )
                .build();
    }
}
