package com.ticket.booking.config;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.kafka.config.TopicBuilder;
import org.apache.kafka.clients.admin.NewTopic;

@Configuration
public class KafkaConfig {
    public static final String BOOKING_TOPIC = "ticket-booking-orders";
    @Bean
    public NewTopic bookingOrdersTopic() {
        return TopicBuilder.name(BOOKING_TOPIC).partitions(3).replicas(1).build();
    }
}
