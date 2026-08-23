package com.ticket.config;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.ReactiveAuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.config.web.server.ServerHttpSecurity;
import org.springframework.security.ldap.authentication.BindAuthenticator;
import org.springframework.security.ldap.authentication.LdapAuthenticationProvider;
import org.springframework.security.ldap.DefaultSpringSecurityContextSource;
import org.springframework.security.ldap.search.FilterBasedLdapUserSearch;
import org.springframework.security.web.server.SecurityWebFilterChain;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.reactive.CorsConfigurationSource;
import org.springframework.web.cors.reactive.UrlBasedCorsConfigurationSource;
import org.springframework.web.reactive.function.server.RouterFunction;
import org.springframework.web.reactive.function.server.RouterFunctions;
import org.springframework.web.reactive.function.server.ServerResponse;
import reactor.core.publisher.Mono;
import reactor.core.scheduler.Schedulers;

import java.util.List;
import java.util.Map;

@Configuration
public class SecurityConfig {
    private static final Logger log = LoggerFactory.getLogger(SecurityConfig.class);

    private final ObjectMapper objectMapper = new ObjectMapper();

    @Bean
    public SecurityWebFilterChain securityWebFilterChain(ServerHttpSecurity http) {
        return http
                .cors(cors -> cors.configurationSource(corsConfigurationSource())) // Enables CORS
                .csrf(ServerHttpSecurity.CsrfSpec::disable)
                // 🚀 2. FIXED: Allow global gateway CORS filters to wrap around all routes cleanly
                .authorizeExchange(exchanges -> exchanges
                        .pathMatchers("/api/v1/auth/login", "/api/v1/auth/register","/api/v1/movies","/api/v1/auth/bookings").permitAll()
                        .anyExchange().permitAll()
                )
                .build();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        var config = new CorsConfiguration();
        config.setAllowedOrigins(List.of("http://localhost:5173")); // Allowed frontend origin
        config.setAllowedMethods(List.of("GET", "POST", "OPTIONS"));
        config.setAllowedHeaders(List.of("Content-Type", "Authorization", "traceparent", "baggage"));
        config.setAllowCredentials(true); // Mandatory for cookies/auth headers

        var source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", config); // Apply to all routes
        return source;
    }

    // 🚀 3. FIXED: Replaced the WebFilter with a Router Function to guarantee CORS compliance
    @Bean
    public RouterFunction<ServerResponse> loginRouter(ReactiveAuthenticationManager authManager) {
        return RouterFunctions.route()
                .POST("/api/v1/auth/login", request -> request.bodyToMono(String.class)
                        .flatMap(bodyString -> {
                            try {
                                Map<String, String> credentials = objectMapper.readValue(bodyString, Map.class);
                                String username = credentials.get("username");
                                String password = credentials.get("password");

                                log.info("📥 [API Gateway] Received login request for user: {}", username);

                                var authToken = new UsernamePasswordAuthenticationToken(username, password);

                                return authManager.authenticate(authToken)
                                        .flatMap(auth -> ServerResponse.ok()
                                                .contentType(MediaType.APPLICATION_JSON)
                                                .bodyValue("""
                                                        {
                                                          "message": "Authentication successful inside API Gateway natively.",
                                                          "authenticated": true
                                                        }
                                                        """))
                                        .onErrorResume(BadCredentialsException.class, ex -> ServerResponse.status(HttpStatus.UNAUTHORIZED)
                                                .contentType(MediaType.APPLICATION_JSON)
                                                .bodyValue("""
                                                        {
                                                          "error": "Invalid LDAP username or password credentials."
                                                        }
                                                        """))
                                        .onErrorResume(ex -> ServerResponse.status(HttpStatus.INTERNAL_SERVER_ERROR)
                                                .contentType(MediaType.APPLICATION_JSON)
                                                .bodyValue("""
                                                        {
                                                          "error": "Directory verification failure runtime drop."
                                                        }
                                                        """));
                            } catch (Exception ex) {
                                return ServerResponse.badRequest().build();
                            }
                        }))
                .build();
    }

    @Bean
    public ReactiveAuthenticationManager reactiveAuthenticationManager() {
        var contextSource = new DefaultSpringSecurityContextSource(
                List.of("ldap://openldap:389"),
                "dc=booking,dc=com"
        );
        contextSource.setUserDn("cn=admin,dc=booking,dc=com");
        contextSource.setPassword("SecretAdminPassword123");

        try {
            contextSource.afterPropertiesSet();
        } catch (Exception ex) {
            // Context source logging fallbacks
        }

        var userSearch = new FilterBasedLdapUserSearch("ou=users", "(uid={0})", contextSource);
        var authenticator = new BindAuthenticator(contextSource);
        authenticator.setUserSearch(userSearch);

        var provider = new LdapAuthenticationProvider(authenticator);

        return authentication -> Mono.fromCallable(() -> provider.authenticate(
                        new UsernamePasswordAuthenticationToken(authentication.getPrincipal(), authentication.getCredentials())
                ))
                .subscribeOn(Schedulers.boundedElastic()) // Prevents blocking the Netty reactive engine loops!
                .onErrorMap(Exception.class, ex -> {
                    if (ex instanceof org.springframework.security.authentication.BadCredentialsException) {
                        return new BadCredentialsException("Invalid credentials profile matching path.");
                    }
                    return new RuntimeException(ex.getMessage(), ex);
                });
    }
}
