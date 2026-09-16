package com.ticket.config;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.ticket.service.JwtService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseCookie;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.authentication.ReactiveAuthenticationManager;
import org.springframework.security.config.annotation.web.reactive.EnableWebFluxSecurity;
import org.springframework.security.config.web.server.ServerHttpSecurity;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.ldap.authentication.BindAuthenticator;
import org.springframework.security.ldap.authentication.LdapAuthenticationProvider;
import org.springframework.security.ldap.search.FilterBasedLdapUserSearch;
import org.springframework.security.ldap.DefaultSpringSecurityContextSource;
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
@EnableWebFluxSecurity
public class SecurityConfig {

    private static final Logger log = LoggerFactory.getLogger(SecurityConfig.class);
    private final ObjectMapper objectMapper = new ObjectMapper();

    @Bean
    public SecurityWebFilterChain securityWebFilterChain(ServerHttpSecurity http, CorsConfigurationSource corsSource) {
        return http
                .csrf(ServerHttpSecurity.CsrfSpec::disable)
                .cors(cors -> cors.configurationSource(corsSource))
                // 🚀 FIX 1: Turn off default entry-point HTTP Basic challenges completely to stop browser pop-ups
                .httpBasic(ServerHttpSecurity.HttpBasicSpec::disable)
                .formLogin(ServerHttpSecurity.FormLoginSpec::disable)
                // 🚀 FIX 2: Intercept unauthorized attempts and issue standard JSON errors instead of prompt loops
                .exceptionHandling(exception -> exception
                        .authenticationEntryPoint((exchange, e) -> {
                            exchange.getResponse().setStatusCode(HttpStatus.UNAUTHORIZED);
                            exchange.getResponse().getHeaders().setContentType(MediaType.APPLICATION_JSON);
                            return exchange.getResponse().writeWith(Mono.just(
                                    exchange.getResponse().bufferFactory().wrap("{\"error\":\"Bearer token required or expired.\"}".getBytes())
                            ));
                        })
                )
                .authorizeExchange(exchanges -> exchanges
                        .pathMatchers("/api/v1/auth/login", "/api/v1/auth/logout").permitAll()
                        .anyExchange().permitAll() // Offload secure validation down to the declarative Gateway Filters below
                )
                .build();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        var config = new CorsConfiguration();
        config.setAllowedOrigins(List.of("http://localhost:5173"));
        config.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        config.setAllowedHeaders(List.of("*"));
        config.setAllowCredentials(true);

        var source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", config);
        return source;
    }

    @Bean
    public ReactiveAuthenticationManager reactiveAuthenticationManager() {
        var contextSource = new DefaultSpringSecurityContextSource(List.of("ldap://openldap:389"), "dc=booking,dc=com");
        contextSource.setUserDn("cn=admin,dc=booking,dc=com");
        contextSource.setPassword("SecretAdminPassword123");

        try { contextSource.afterPropertiesSet(); } catch (Exception e) { log.error("LDAP Init error", e); }

        var userSearch = new FilterBasedLdapUserSearch("ou=users", "(uid={0})", contextSource);
        var authenticator = new BindAuthenticator(contextSource);
        authenticator.setUserSearch(userSearch);

        return authentication -> Mono.fromCallable(() -> new LdapAuthenticationProvider(authenticator).authenticate(
                        new UsernamePasswordAuthenticationToken(authentication.getPrincipal(), authentication.getCredentials())
                ))
                .subscribeOn(Schedulers.boundedElastic());
    }

    @Bean
    public RouterFunction<ServerResponse> loginRouter(ReactiveAuthenticationManager authManager, JwtService jwtService) {
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
                                            UserDetails userDetails = (UserDetails) auth.getPrincipal();
                                            List<String> roles = auth.getAuthorities().stream()
                                                    .map(grantedAuthority -> grantedAuthority.getAuthority())
                                                    .toList();

                                            Map<String, Object> claims = Map.of("roles", roles);
                                            String jwtToken = jwtService.generateToken(userDetails.getUsername(), claims);

                                            ResponseCookie jwtCookie = ResponseCookie.from("authToken", jwtToken)
                                                    .httpOnly(true)
                                                    .secure(false)
                                                    .path("/")
                                                    .maxAge(1800)
                                                    .sameSite("Lax")
                                                    .build();

                                            Map<String, Object> responseBody = Map.of(
                                                    "username", userDetails.getUsername(),
                                                    "authenticated", true,
                                                    "token", jwtToken
                                            );

                                            return ServerResponse.ok()
                                                    .cookie(jwtCookie)
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
                    ResponseCookie deleteCookie = ResponseCookie.from("authToken", "")
                            .httpOnly(true)
                            .path("/")
                            .maxAge(0)
                            .sameSite("Lax")
                            .build();

                    return ServerResponse.ok()
                            .cookie(deleteCookie)
                            .contentType(MediaType.APPLICATION_JSON)
                            .bodyValue(Map.of("message", "Logged out cleanly. Session revoked."));
                })
                .build();
    }
}
