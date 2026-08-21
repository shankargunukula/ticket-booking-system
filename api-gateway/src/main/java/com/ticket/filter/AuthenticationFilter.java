package com.ticket.filter;

import com.ticket.service.JwtService;
import io.jsonwebtoken.Claims;
import io.micrometer.observation.ObservationRegistry;
import io.micrometer.observation.contextpropagation.ObservationThreadLocalAccessor;
import org.springframework.cloud.gateway.filter.GatewayFilter;
import org.springframework.cloud.gateway.filter.factory.AbstractGatewayFilterFactory;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.server.reactive.ServerHttpRequest;
import org.springframework.http.server.reactive.ServerHttpResponse;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ServerWebExchange;
import reactor.core.publisher.Mono;
import reactor.util.context.Context;

@Component("AuthenticationFilter")
public class AuthenticationFilter extends AbstractGatewayFilterFactory<AuthenticationFilter.Config> {

    private final JwtService jwtService;
    private final ObservationRegistry observationRegistry;

    // Inject ObservationRegistry alongside JwtService to capture active traces
    public AuthenticationFilter(JwtService jwtService, ObservationRegistry observationRegistry) {
        super(Config.class);
        this.jwtService = jwtService;
        this.observationRegistry = observationRegistry;
    }

    public static class Config {}

    @Override
    public GatewayFilter apply(Config config) {
        return (exchange, chain) -> {
            ServerHttpRequest request = exchange.getRequest();

            if (!request.getHeaders().containsKey(HttpHeaders.AUTHORIZATION)) {
                return onError(exchange, HttpStatus.UNAUTHORIZED);
            }

            String authHeader = request.getHeaders().getFirst(HttpHeaders.AUTHORIZATION);
            if (authHeader == null || !authHeader.startsWith("Bearer ")) {
                return onError(exchange, HttpStatus.UNAUTHORIZED);
            }

            String token = authHeader.substring(7);
            if (!jwtService.isTokenValid(token)) {
                return onError(exchange, HttpStatus.UNAUTHORIZED);
            }

            Claims claims = jwtService.extractAllClaims(token);

            // Safe conversion prevents NullPointerException
            String roles = claims.get("roles") != null ? String.valueOf(claims.get("roles")) : "ROLE_USER";

            // Mutate request headers to forward user context to down-stream services safely
            ServerHttpRequest mutatedRequest = exchange.getRequest().mutate()
                    .header("X-Authenticated-User", claims.getSubject())
                    .header("X-User-Roles", roles)
                    .build();

            // CRUCIAL FOR SPRING BOOT 3: Attach the active observation trace to the mutated pipeline
            return chain.filter(exchange.mutate().request(mutatedRequest).build())
                    .contextWrite(context -> {
                        if (observationRegistry.getCurrentObservation() != null) {
                            return context.put(ObservationThreadLocalAccessor.KEY, observationRegistry.getCurrentObservation());
                        }
                        return context;
                    });
        };
    }

    private Mono<Void> onError(ServerWebExchange exchange, HttpStatus status) {
        ServerHttpResponse response = exchange.getResponse();
        response.setStatusCode(status);
        return response.setComplete();
    }
}
