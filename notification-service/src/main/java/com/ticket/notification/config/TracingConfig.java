package com.ticket.notification.config;

import jakarta.annotation.PostConstruct;
import org.springframework.context.annotation.Configuration;
import reactor.core.publisher.Hooks;

@Configuration
public class TracingConfig {

    @PostConstruct
    public void init() {
        // Enforces Project Reactor to pass Micrometer Trace IDs across asynchronous thread transitions
        Hooks.enableAutomaticContextPropagation();
    }
}
