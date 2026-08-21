package com.ticket.booking.config;

import org.apache.kafka.clients.admin.NewTopic;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.kafka.config.TopicBuilder;

@Configuration
public class KafkaConfig {

    // Core Topic Identity matched explicitly to your streaming structures
    public static final String BOOKING_TOPIC = "ticket-booking-orders";

    @Bean
    public NewTopic bookingOrdersTopic() {
        return TopicBuilder.name(BOOKING_TOPIC)
                .partitions(3)
                .replicas(1)
                .build();
    }
}
