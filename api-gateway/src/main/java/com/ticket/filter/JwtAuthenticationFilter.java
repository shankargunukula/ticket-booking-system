package com.ticket.filter;

import com.ticket.service.JwtService;
import org.springframework.cloud.gateway.filter.GatewayFilter;
import org.springframework.cloud.gateway.filter.factory.AbstractGatewayFilterFactory;
import org.springframework.http.HttpCookie;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.server.reactive.ServerHttpRequest;
import org.springframework.http.server.reactive.ServerHttpResponse;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ServerWebExchange;
import reactor.core.publisher.Mono;

import java.util.Collections;
import java.util.List;

@Component
public class JwtAuthenticationFilter extends AbstractGatewayFilterFactory<JwtAuthenticationFilter.Config> {

    private final JwtService jwtService;

    public JwtAuthenticationFilter(JwtService jwtService) {
        super(Config.class);
        this.jwtService = jwtService;
    }

    @Override
    public GatewayFilter apply(Config config) {
        return (exchange, chain) -> {
            ServerHttpRequest request = exchange.getRequest();
            String token = null;

            // Strategy A: Check standard Authorization header
            if (request.getHeaders().containsKey(HttpHeaders.AUTHORIZATION)) {
                String authHeader = request.getHeaders().getFirst(HttpHeaders.AUTHORIZATION);
                if (authHeader != null && authHeader.startsWith("Bearer ")) {
                    token = authHeader.substring(7);
                }
            }

            // Strategy B: Fallback to verification via HttpOnly cookies
            if (token == null && request.getCookies().containsKey("authToken")) {
                HttpCookie cookie = request.getCookies().getFirst("authToken");
                if (cookie != null) {
                    token = cookie.getValue();
                }
            }

            // If no token is found, block access immediately (Enforces the LDAP wall)
            if (token == null) {
                return onError(exchange, "Missing Security Bearer Token Context", HttpStatus.UNAUTHORIZED);
            }

            // Cryptographically validate the token expiration and signature
            if (!jwtService.isTokenValid(token)) {
                return onError(exchange, "Expired or Invalid Security Token", HttpStatus.UNAUTHORIZED);
            }

            // Extract claims safely, defaulting to empty list if no roles exist in LDAP yet
            List<?> rawRoles = jwtService.extractClaim(token, claims -> claims.get("roles", List.class));
            List<String> userRoles = rawRoles != null ? rawRoles.stream().map(Object::toString).toList() : Collections.emptyList();

            // 🚀 ROLE CHECK IS NOW CONDITIONAL: Only checks if roles are provided in config args
            if (config.getRequiredRoles() != null && !config.getRequiredRoles().isEmpty()) {
                boolean hasRequiredRole = config.getRequiredRoles().stream().anyMatch(userRoles::contains);
                if (!hasRequiredRole) {
                    return onError(exchange, "Access Denied: Insufficient Domain Authorization Rights", HttpStatus.FORBIDDEN);
                }
            }

            // Propagate verified identity metadata headers downstream to the booking service
            String username = jwtService.extractUsername(token);
            ServerHttpRequest mutatedRequest = request.mutate()
                    .header("X-Authenticated-User", username)
                    .header("X-Authenticated-Roles", String.join(",", userRoles))
                    .build();

            return chain.filter(exchange.mutate().request(mutatedRequest).build());
        };
    }

    private Mono<Void> onError(ServerWebExchange exchange, String error, HttpStatus status) {
        ServerHttpResponse response = exchange.getResponse();
        response.setStatusCode(status);
        response.getHeaders().add("X-Gateway-Auth-Error", error);
        return response.setComplete();
    }

    public static class Config {
        private List<String> requiredRoles;
        public List<String> getRequiredRoles() { return requiredRoles; }
        public void setRequiredRoles(List<String> requiredRoles) { this.requiredRoles = requiredRoles; }
    }
}
