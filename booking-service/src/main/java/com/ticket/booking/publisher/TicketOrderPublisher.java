package com.ticket.booking.publisher;

import com.ticket.booking.config.KafkaConfig;
import com.ticket.booking.model.TicketOrderEvent;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.kafka.support.SendResult;
import org.springframework.stereotype.Component;

import java.util.concurrent.CompletableFuture;

@Slf4j
@Component
@RequiredArgsConstructor
public class TicketOrderPublisher {

    // Inject spring boot auto-configured template parameterized with key (String) and message record payload
    private final KafkaTemplate<String, TicketOrderEvent> kafkaTemplate;

    /**
     * Publishes a ticket event messaging footprint downstream onto the Kafka broker cluster asynchronously.
     * Uses Java 21 CompletableFuture pipelines to catch cluster delivery verification offsets cleanly.
     *
     * @param event The immutable record tracking object containing seat/order indices.
     */
    public void publishBookingEvent(TicketOrderEvent event) {
        log.info("Preparing asynchronous streaming drop sequence onto topic: {} for Order ID: {}",
                KafkaConfig.BOOKING_TOPIC, event.orderId());

        // Uses Event ID as the message partition routing key to ensure same-event orders are processed sequentially
        CompletableFuture<SendResult<String, TicketOrderEvent>> clusterFuture =
                kafkaTemplate.send(KafkaConfig.BOOKING_TOPIC, event.eventId(), event);

        // Modern non-blocking callback pipeline handles connection receipts or network timeouts gracefully
        clusterFuture.whenComplete((deliveryReceipt, exception) -> {
            if (exception == null) {
                log.info("Message partition delivery confirmed. Order reference [{}] mapped onto partition {} with logging offset [{}]",
                        event.orderId(),
                        deliveryReceipt.getRecordMetadata().partition(),
                        deliveryReceipt.getRecordMetadata().offset());
            } else {
                log.error("Broker cluster pipeline connection timeout dropping payload package for order [{}]. Error: {}",
                        event.orderId(), exception.getMessage(), exception);

                // Fallback strategies here (e.g., dead-letter queue routing, local transactional outbox tables)
                handlePipelineFailure(event, exception);
            }
        });
    }

    private void handlePipelineFailure(TicketOrderEvent event, Throwable exception) {
        log.warn("Executing fallback transaction processing for failed stream payload context: {}", event.orderId());
    }
}
