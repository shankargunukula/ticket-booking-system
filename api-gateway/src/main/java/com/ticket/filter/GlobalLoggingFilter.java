package com.ticket.gateway.filter;

import io.micrometer.tracing.Tracer;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.cloud.gateway.filter.GatewayFilterChain;
import org.springframework.cloud.gateway.filter.GlobalFilter;
import org.springframework.core.Ordered;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ServerWebExchange;
import reactor.core.publisher.Mono;

@Component
public class GlobalLoggingFilter implements GlobalFilter, Ordered {

    private static final Logger logger = LoggerFactory.getLogger(GlobalLoggingFilter.class);

    private final Tracer tracer;

    @Value("${spring.application.name:api-gateway}")
    private String appId;

    // Autowire Micrometer Tracer context bean
    public GlobalLoggingFilter(Tracer tracer) {
        this.tracer = tracer;
    }

    @Override
    public Mono<Void> filter(ServerWebExchange exchange, GatewayFilterChain chain) {
        // 1. Capture basic request URI metadata properties
        String path = exchange.getRequest().getPath().value();
        String method = exchange.getRequest().getMethod().name();

        // 2. Safely parse active Tracing variables from current context stream
        String traceId = "N/A";
        String spanId = "N/A";

        if (tracer != null && tracer.currentSpan() != null && tracer.currentSpan().context() != null) {
            traceId = tracer.currentSpan().context().traceId();
            spanId = tracer.currentSpan().context().spanId();
        }

        // 3. Print unified structural audit entry block for terminal checking
        logger.info("👉 [HIT ENGINE] - Method: {} | Path: {} | appid: {} | traceid: {} | spanid: {}",
                method, path, appId, traceId, spanId);

        // 4. Continue pushing execution request cleanly onward to next microservice downstream
        return chain.filter(exchange);
    }

    @Override
    public int getOrder() {
        // High execution priority ensures it records tracking metrics first before anything filters out
        return Ordered.HIGHEST_PRECEDENCE;
    }
}
