package com.ticket.config;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.ticket.util.JwtUtil;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseCookie;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.ReactiveAuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.config.web.server.ServerHttpSecurity;
import org.springframework.security.config.web.server.SecurityWebFiltersOrder;
import org.springframework.security.ldap.authentication.BindAuthenticator;
import org.springframework.security.ldap.authentication.LdapAuthenticationProvider;
import org.springframework.security.ldap.DefaultSpringSecurityContextSource;
import org.springframework.security.ldap.search.FilterBasedLdapUserSearch;
import org.springframework.security.ldap.userdetails.LdapUserDetails;
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

    private final JwtUtil jwtUtil;
    private final JwtTokenAuthenticationFilter jwtAuthFilter;

    public SecurityConfig(JwtUtil jwtUtil, JwtTokenAuthenticationFilter jwtAuthFilter) {
        this.jwtUtil = jwtUtil;
        this.jwtAuthFilter = jwtAuthFilter;
    }

    @Bean
    public SecurityWebFilterChain securityWebFilterChain(ServerHttpSecurity http) {
        return http
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))
                .csrf(ServerHttpSecurity.CsrfSpec::disable)
                .addFilterBefore(jwtAuthFilter, SecurityWebFiltersOrder.AUTHENTICATION)
                .authorizeExchange(exchanges -> exchanges
                        .pathMatchers("/api/v1/auth/login", "/api/v1/auth/logout").permitAll()
                        .pathMatchers("/api/v1/movies/**", "/api/v1/auth/bookings/**").authenticated()
                        .anyExchange().permitAll()
                )
                .build();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        var config = new CorsConfiguration();
        // Mandatory configuration parameters for cross-origin credentials cookies
        config.setAllowedOrigins(List.of("http://localhost:5173"));
        config.setAllowedMethods(List.of("GET", "POST", "OPTIONS"));
        config.setAllowedHeaders(List.of("Content-Type", "Authorization"));
        config.setAllowCredentials(true); // REQUIRED to permit HttpOnly tracking loops

        var source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", config);
        return source;
    }

    @Bean
    public RouterFunction<ServerResponse> loginRouter(ReactiveAuthenticationManager authManager) {
        return RouterFunctions.route()
                .POST("/api/v1/auth/login", request -> request.bodyToMono(String.class)
                        .flatMap(bodyString -> {
                            try {
                                Map<String, String> credentials = objectMapper.readValue(bodyString, Map.class);
                                String username = credentials.get("username");
                                String password = credentials.get("password");

                                log.info("📥 [API Gateway] Processing Secure Login via LDAP: {}", username);
                                var authToken = new UsernamePasswordAuthenticationToken(username, password);

                                return authManager.authenticate(authToken)
                                        .flatMap(auth -> {
                                            LdapUserDetails ldapUser = (LdapUserDetails) auth.getPrincipal();
                                            String jwtToken = jwtUtil.generateToken(ldapUser);

                                            // 🚀 GENERATE HTTPONLY COOKIE STRATEGY
                                            ResponseCookie jwtCookie = ResponseCookie.from("authToken", jwtToken)
                                                    .httpOnly(true)       // Inaccessible to browser JavaScript engines
                                                    .secure(false)        // Set true in production over HTTPS environments
                                                    .path("/")            // Valid for all gateway child sub-routes
                                                    .maxAge(1800)         // Matches explicit 30 minutes threshold (in seconds)
                                                    .sameSite("Lax")      // Protects cross-origin routing validation metrics
                                                    .build();

                                            Map<String, Object> responseBody = Map.of(
                                                    "username", ldapUser.getUsername(),
                                                    "dn", ldapUser.getDn(),
                                                    "authenticated", true
                                            );

                                            return ServerResponse.ok()
                                                    .cookie(jwtCookie) // Append authentication cookie directly
                                                    .contentType(MediaType.APPLICATION_JSON)
                                                    .bodyValue(responseBody);
                                        })
                                        .onErrorResume(BadCredentialsException.class, ex -> ServerResponse.status(HttpStatus.UNAUTHORIZED)
                                                .contentType(MediaType.APPLICATION_JSON)
                                                .bodyValue(Map.of("error", "Invalid LDAP profiles.")))
                                        .onErrorResume(ex -> ServerResponse.status(HttpStatus.INTERNAL_SERVER_ERROR)
                                                .contentType(MediaType.APPLICATION_JSON)
                                                .bodyValue(Map.of("error", "Directory mapping error drops.")));
                            } catch (Exception ex) {
                                return ServerResponse.badRequest().build();
                            }
                        }))
                .POST("/api/v1/auth/logout", request -> {
                    // 🚀 CLEAR COOKIE STRATEGY ON LOGOUT
                    ResponseCookie deleteCookie = ResponseCookie.from("authToken", "")
                            .httpOnly(true)
                            .path("/")
                            .maxAge(0) // Destroys the cookie instantly
                            .sameSite("Lax")
                            .build();

                    return ServerResponse.ok()
                            .cookie(deleteCookie)
                            .contentType(MediaType.APPLICATION_JSON)
                            .bodyValue(Map.of("message", "Logged out cleanly. Session revoked."));
                })
                .build();
    }

    @Bean
    public ReactiveAuthenticationManager reactiveAuthenticationManager() {
        var contextSource = new DefaultSpringSecurityContextSource(List.of("ldap://openldap:389"), "dc=booking,dc=com");
        contextSource.setUserDn("cn=admin,dc=booking,dc=com");
        contextSource.setPassword("SecretAdminPassword123");

        try { contextSource.afterPropertiesSet(); } catch (Exception e) { log.error("LDAP error", e); }

        var userSearch = new FilterBasedLdapUserSearch("ou=users", "(uid={0})", contextSource);
        var authenticator = new BindAuthenticator(contextSource);
        authenticator.setUserSearch(userSearch);

        return authentication -> Mono.fromCallable(() -> new LdapAuthenticationProvider(authenticator).authenticate(
                        new UsernamePasswordAuthenticationToken(authentication.getPrincipal(), authentication.getCredentials())
                ))
                .subscribeOn(Schedulers.boundedElastic());
    }
}
