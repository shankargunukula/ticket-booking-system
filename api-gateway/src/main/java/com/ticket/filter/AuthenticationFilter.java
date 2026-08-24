package com.ticket.filter;

import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.cloud.gateway.filter.GatewayFilter;
import org.springframework.cloud.gateway.filter.factory.AbstractGatewayFilterFactory;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.server.reactive.ServerHttpRequest;
import org.springframework.http.server.reactive.ServerHttpResponse;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ServerWebExchange;
import reactor.core.publisher.Mono;
import java.nio.charset.StandardCharsets;
import javax.crypto.SecretKey;

@Component
public class AuthenticationFilter extends AbstractGatewayFilterFactory<AuthenticationFilter.Config> {

    // IMPORTANT: Use the exact same signature key configured in your Token-issuing Auth service!
    private final String SECRET_KEY = "YOUR_SUPER_SECRET_STRONG_KEY_HERE_MUST_BE_32_BYTES_LONG";

    public AuthenticationFilter() {
        super(Config.class);
    }

    public static class Config {
        // Put runtime filtering configurations here if required
    }

    @Override
    public GatewayFilter apply(Config config) {
        return (exchange, chain) -> {
            ServerHttpRequest request = exchange.getRequest();

            // 1. Look for the Bearer token inside the incoming Authorization header
            if (!request.getHeaders().containsKey(HttpHeaders.AUTHORIZATION)) {
                return onError(exchange, "Missing Authorization Header Metadata", HttpStatus.UNAUTHORIZED);
            }

            String authHeader = request.getHeaders().getFirst(HttpHeaders.AUTHORIZATION);
            if (authHeader == null || !authHeader.startsWith("Bearer ")) {
                return onError(exchange, "Invalid Authorization Header Format", HttpStatus.UNAUTHORIZED);
            }

            String token = authHeader.substring(7);

            try {
                // 2. Validate the JWT token signature using your shared secret key
                SecretKey key = Keys.hmacShaKeyFor(SECRET_KEY.getBytes(StandardCharsets.UTF_8));

                // This step will automatically throw an exception if the token is expired or altered
                Jwts.parser()
                        .setSigningKey(key)
                        .build()
                        .parseClaimsJws(token);

            } catch (Exception e) {
                return onError(exchange, "Unauthorized Token Access: " + e.getMessage(), HttpStatus.UNAUTHORIZED);
            }

            // 3. Token is entirely valid! Continue the routing chain to the microservice
            return chain.filter(exchange);
        };
    }

    private Mono<Void> onError(ServerWebExchange exchange, String err, HttpStatus httpStatus) {
        ServerHttpResponse response = exchange.getResponse();
        response.setStatusCode(httpStatus);
        return response.setComplete();
    }
}
