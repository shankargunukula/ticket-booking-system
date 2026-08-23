package com.ticket.booking.publisher;

import com.ticket.booking.model.TicketOrderEvent;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.kafka.support.SendResult;
import org.springframework.stereotype.Component;

import java.util.concurrent.CompletableFuture;

@Component
public class TicketOrderPublisher {

    private static final Logger logger = LoggerFactory.getLogger(TicketOrderPublisher.class);

    // Explicit Kafka Topic Identifier string targeting core checkout processing workflows
    private static final String TOPIC_NAME = "ticket-orders-topic";

    private final KafkaTemplate<String, TicketOrderEvent> kafkaTemplate;

    // Java 21 Constructor Injection Strategy
    public TicketOrderPublisher(KafkaTemplate<String, TicketOrderEvent> kafkaTemplate) {
        this.kafkaTemplate = kafkaTemplate;
    }

    /**
     * Pushes structural booking records out onto the Kafka transaction pipeline stream.
     * Uses non-blocking Java CompletableFuture callback triggers.
     */
    public void sendTicketOrderToBroker(TicketOrderEvent event) {
        logger.info("Initializing outbound Kafka transmission for transaction ID: {}", event.transactionId());

        // Asynchronous, non-blocking message routing dispatch
        CompletableFuture<SendResult<String, TicketOrderEvent>> futureResult =
                kafkaTemplate.send(TOPIC_NAME, event.transactionId(), event);

        // Modern Java callback hooks handling record commitments cleanly
        futureResult.whenComplete((result, exception) -> {
            if (exception == null) {
                logger.info("Transaction event successfully acknowledged by Kafka partition metadata log. Offset: {}",
                        result.getRecordMetadata().offset());
            } else {
                logger.error("Critical delivery failure encountered publishing message cluster to Kafka broker stream", exception);
                // Trigger fallback logic structures, dead-letter queues, or notification loops here if necessary
            }
        });
    }
}
