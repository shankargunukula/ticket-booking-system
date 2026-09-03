package com.ticket.filter;

import org.springframework.cloud.gateway.filter.GatewayFilter;
import org.springframework.cloud.gateway.filter.factory.AbstractGatewayFilterFactory;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.server.reactive.ServerHttpRequest;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ServerWebExchange;
import reactor.core.publisher.Mono;

@Component
public class JwtValidationFilter extends AbstractGatewayFilterFactory<JwtValidationFilter.Config> {

    public JwtValidationFilter() {
        super(Config.class);
    }

    public static class Config {
        // Configuration parameters if required
    }

    @Override
    public GatewayFilter apply(Config config) {
        return (exchange, chain) -> {
            ServerHttpRequest request = exchange.getRequest();

            // 1. Isolate the Authorization Header
            if (!request.getHeaders().containsKey(HttpHeaders.AUTHORIZATION)) {
                return onError(exchange, "Missing Authorization Header", HttpStatus.UNAUTHORIZED);
            }

            String authHeader = request.getHeaders().getFirst(HttpHeaders.AUTHORIZATION);
            if (authHeader == null || !authHeader.startsWith("Bearer ")) {
                return onError(exchange, "Invalid Authorization Header Format", HttpStatus.UNAUTHORIZED);
            }

            String token = authHeader.substring(7);

            try {
                // 2. Perform JWT Validation Verification Logic
                // Example: JwtDecoder.decode(token) or a call to validation utility
                boolean isValid = validateTokenWithAuthEngine(token);
                if (!isValid) {
                    return onError(exchange, "Invalid or Expired JWT Token", HttpStatus.UNAUTHORIZED);
                }

                // Optional: Extract Claims (e.g., userId) and pass forward via headers
                String userId = "extracted-user-id";
                ServerHttpRequest mutatedRequest = request.mutate()
                        .header("X-User-Id", userId)
                        .build();

                return chain.filter(exchange.mutate().request(mutatedRequest).build());

            } catch (Exception e) {
                return onError(exchange, "JWT Token Validation Failed", HttpStatus.UNAUTHORIZED);
            }
        };
    }

    private boolean validateTokenWithAuthEngine(String token) {
        // Implement token verification against your registration-service
        // signature keys or secret mapping string here.
        return true;
    }

    private Mono<Void> onError(ServerWebExchange exchange, String err, HttpStatus status) {
        exchange.getResponse().setStatusCode(status);
        return exchange.getResponse().setComplete();
    }
}
