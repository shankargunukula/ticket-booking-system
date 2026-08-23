package com.ticket.booking.config;

import com.ticket.booking.model.TicketOrderEvent;
import org.apache.kafka.clients.admin.NewTopic;
import org.apache.kafka.clients.consumer.ConsumerConfig;
import org.apache.kafka.clients.producer.ProducerConfig;
import org.apache.kafka.common.serialization.StringDeserializer;
import org.apache.kafka.common.serialization.StringSerializer;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.kafka.config.ConcurrentKafkaListenerContainerFactory;
import org.springframework.kafka.config.TopicBuilder;
import org.springframework.kafka.core.*;
import org.springframework.kafka.support.serializer.JsonDeserializer;
import org.springframework.kafka.support.serializer.JsonSerializer;

import java.util.HashMap;
import java.util.Map;

@Configuration
public class KafkaConfig {

    private final String bootstrapServers = "localhost:9092"; // Fallback connection string path

    // 1. AUTOMATED TOPIC DEPLOYMENT BLUEPRINT
    @Bean
    public NewTopic ticketOrdersTopic() {
        return TopicBuilder.name("ticket-orders-topic")
                .partitions(3) // Decoupled parallel execution parameters
                .replicas(1)
                .build();
    }

    // 2. PRODUCER PIPELINE STRUCTURAL ENGINE CONFIGURATIONS
    @Bean
    public ProducerFactory<String, TicketOrderEvent> producerFactory() {
        Map<String, Object> configProps = new HashMap<>();
        configProps.put(ProducerConfig.BOOTSTRAP_SERVERS_CONFIG, bootstrapServers);
        configProps.put(ProducerConfig.KEY_SERIALIZER_CLASS_CONFIG, StringSerializer.class);
        configProps.put(ProducerConfig.VALUE_SERIALIZER_CLASS_CONFIG, JsonSerializer.class);
        return new DefaultKafkaProducerFactory<>(configProps);
    }

    @Bean
    public KafkaTemplate<String, TicketOrderEvent> kafkaTemplate() {
        return new KafkaTemplate<>(producerFactory());
    }

    // 3. CONSUMER PIPELINE STRUCTURAL ENGINE CONFIGURATIONS
    @Bean
    public ConsumerFactory<String, TicketOrderEvent> consumerFactory() {
        Map<String, Object> configProps = new HashMap<>();
        configProps.put(ConsumerConfig.BOOTSTRAP_SERVERS_CONFIG, bootstrapServers);
        configProps.put(ConsumerConfig.GROUP_ID_CONFIG, "ticket-booking-consumer-group");
        configProps.put(ConsumerConfig.KEY_DESERIALIZER_CLASS_CONFIG, StringDeserializer.class);
        configProps.put(ConsumerConfig.VALUE_DESERIALIZER_CLASS_CONFIG, JsonDeserializer.class);

        // Target explicit deserializer parameters mapping directly against your Java 21 Record package
        var jsonDeserializer = new JsonDeserializer<>(TicketOrderEvent.class);
        jsonDeserializer.addTrustedPackages("com.ticket.booking.model");
        jsonDeserializer.setUseTypeHeaders(false);

        return new DefaultKafkaConsumerFactory<>(configProps, new StringDeserializer(), jsonDeserializer);
    }

    @Bean
    public ConcurrentKafkaListenerContainerFactory<String, TicketOrderEvent> kafkaListenerContainerFactory() {
        var factory = new ConcurrentKafkaListenerContainerFactory<String, TicketOrderEvent>();
        factory.setConsumerFactory(consumerFactory());
        return factory;
    }
}
