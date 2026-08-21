package com.ticket.config;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.reactive.function.client.WebClient;

@Configuration
public class WebClientConfig {

    @Bean
    public WebClient notificationWebClient(WebClient.Builder webClientBuilder) {
        // ALWAYS use the injected builder! It contains the Micrometer tracing filters.
        return webClientBuilder
                .baseUrl("http://notification-service:8082")
                .build();
    }
}
