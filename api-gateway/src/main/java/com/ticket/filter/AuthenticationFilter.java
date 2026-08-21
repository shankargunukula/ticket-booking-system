package com.ticket.filter;

import com.ticket.service.JwtService;
import lombok.Getter;
import lombok.Setter;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.cloud.gateway.filter.GatewayFilter;
import org.springframework.cloud.gateway.filter.factory.AbstractGatewayFilterFactory;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.server.reactive.ServerHttpRequest;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ResponseStatusException;

@Slf4j
@Component
public class AuthenticationFilter extends AbstractGatewayFilterFactory<AuthenticationFilter.Config> {

    @Autowired
    private JwtService jwtService;

    public AuthenticationFilter() {
        super(Config.class);
    }

    @Override
    public GatewayFilter apply(Config config) {
        return (exchange, chain) -> {
            ServerHttpRequest request = exchange.getRequest();
            String authHeader = request.getHeaders().getFirst(HttpHeaders.AUTHORIZATION);

            // FIXED: Using standard "when" syntax for compatibility across Java versions
            String token = switch (authHeader) {
                case null -> throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Missing authorization credentials");
                case String h when h.startsWith("Bearer ") -> h.substring(7);
                default -> throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Malformed authorization signature format");
            };

            if (jwtService.isTokenValid(token)) {
                String phone = jwtService.extractUsername(token);
                log.info("Token verified for mobile user context: {}", phone);

                ServerHttpRequest mutatedRequest = request.mutate()
                        .header("X-Authenticated-User-Mobile", phone)
                        .build();
                return chain.filter(exchange.mutate().request(mutatedRequest).build());
            }

            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Provided token is invalid or expired");
        };
    }

    @Getter
    @Setter
    public static class Config {
        private boolean enabled = true;
    }
}
