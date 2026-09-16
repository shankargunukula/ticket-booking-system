package com.ticket.filter;

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

    public GlobalLoggingFilter(Tracer tracer) {
        this.tracer = tracer;
    }

    @Override
    public Mono<Void> filter(ServerWebExchange exchange, GatewayFilterChain chain) {
        String path = exchange.getRequest().getPath().value();
        String method = exchange.getRequest().getMethod().name();

        // 🚀 FIXED: Defer log evaluation to run inside the context-aware reactive stream
        return Mono.defer(() -> {
            String traceId = "N/A";
            String spanId = "N/A";

            if (tracer != null && tracer.currentSpan() != null && tracer.currentSpan().context() != null) {
                traceId = tracer.currentSpan().context().traceId();
                spanId = tracer.currentSpan().context().spanId();
            }

            logger.info("👉 [HIT ENGINE] - Method: {} | Path: {} | appid: {} | traceid: {} | spanid: {}",
                    method, path, appId, traceId, spanId);

            return chain.filter(exchange);
        });
    }

    @Override
    public int getOrder() {
        // High execution priority ensuring metrics are recorded before tracking filters out
        return Ordered.HIGHEST_PRECEDENCE;
    }
}
