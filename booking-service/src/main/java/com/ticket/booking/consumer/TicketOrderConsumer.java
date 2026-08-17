package com.ticket.booking.consumer;

import com.ticket.booking.config.KafkaConfig;
import com.ticket.booking.entity.EventInventory;
import com.ticket.booking.entity.TicketOrder;
import com.ticket.booking.model.TicketOrderEvent;
import com.ticket.booking.repository.EventInventoryRepository;
import com.ticket.booking.repository.TicketOrderRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.Optional;

@Service
public class TicketOrderConsumer {

    private static final Logger log = LoggerFactory.getLogger(TicketOrderConsumer.class);

    @Autowired
    private TicketOrderRepository orderRepository;

    @Autowired
    private EventInventoryRepository inventoryRepository;

    /**
     * Listens to the Kafka topic. Multiple app replicas will automatically
     * share the load thanks to the consumer group structure.
     */
    @KafkaListener(
            topics = KafkaConfig.BOOKING_TOPIC,
            groupId = "ticket-fulfillment-group",
            properties = {"spring.json.value.default.type=com.ticket.booking.model.TicketOrderEvent"}
    )
    @Transactional // 🌟 Encapsulates the operations in a atomic database transaction
    public void consumeTicketOrder(TicketOrderEvent event) {
        log.info("Received booking order stream from Kafka queue. Order ID: {}", event.getOrderId());

        try {
            // Step 1: Query the database seat inventory record
            Optional<EventInventory> seatQuery = inventoryRepository
                    .findByEventIdAndSeatId(event.getEventId(), event.getSeatId());

            if (seatQuery.isPresent()) {
                EventInventory seat = seatQuery.get();

                // Double check to ensure the inventory isn't already locked down/sold in SQL
                if ("AVAILABLE".equals(seat.getStatus())) {

                    // Step 2: Update database inventory state to SOLD
                    seat.setStatus("SOLD");
                    inventoryRepository.save(seat); // Hibernate handles version checking automatically here
                    log.info("Inventory status successfully marked as SOLD for seat: {}", event.getSeatId());

                    // Step 3: Archive transaction history record
                    TicketOrder permanentOrder = new TicketOrder(
                            event.getOrderId(),
                            event.getUserId(),
                            event.getEventId(),
                            event.getSeatId(),
                            "CONFIRMED", // Order finalized successfully
                            event.getCreatedAt(),
                            Instant.now()
                    );
                    orderRepository.save(permanentOrder);
                    log.info("Permanent database transaction finalized for Order: {}", event.getOrderId());

                } else {
                    log.warn("Database conflict: Seat {} is already marked as {}. Over-booking rejected.",
                            event.getSeatId(), seat.getStatus());
                    handleFailedOrder(event, "SEAT_ALREADY_TAKEN");
                }
            } else {
                log.error("Invalid Event/Seat identifier target parsed: {} - {}", event.getEventId(), event.getSeatId());
                handleFailedOrder(event, "INVALID_SEAT");
            }

        } catch (org.springframework.orm.ObjectOptimisticLockingFailureException ex) {
            // Triggered if two consumers concurrently try to update the exact same version row
            log.error("Optimistic locking crash detected! Another consumer modified version data first for seat: {}", event.getSeatId());
            handleFailedOrder(event, "CONCURRENCY_FAIL");
        } catch (Exception ex) {
            log.error("Fulfillment engine breakdown processing event order: {}", event.getOrderId(), ex);
            handleFailedOrder(event, "SYSTEM_ERROR");
        }
    }

    private void handleFailedOrder(TicketOrderEvent event, String reason) {
        TicketOrder failedOrder = new TicketOrder(
                event.getOrderId(),
                event.getUserId(),
                event.getEventId(),
                event.getSeatId(),
                "FAILED_" + reason,
                event.getCreatedAt(),
                Instant.now()
        );
        orderRepository.save(failedOrder);
    }
}
