package com.ticket.booking.consumer;

import com.ticket.booking.config.KafkaConfig;
import com.ticket.booking.entity.EventInventory;
import com.ticket.booking.entity.TicketOrder;
import com.ticket.booking.model.TicketOrderEvent;
import com.ticket.booking.repository.EventInventoryRepository;
import com.ticket.booking.repository.TicketOrderRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.Instant;
import java.util.Optional;

@Slf4j
@Service
@RequiredArgsConstructor
public class TicketOrderConsumer {

    private final TicketOrderRepository orderRepository;
    private final EventInventoryRepository inventoryRepository;

    @KafkaListener(
            topics = KafkaConfig.BOOKING_TOPIC,
            groupId = "ticket-fulfillment-group",
            properties = {"spring.json.value.default.type=com.ticket.booking.model.TicketOrderEvent"}
    )
    @Transactional
    public void consumeTicketOrder(TicketOrderEvent event) {
        log.info("Received booking order stream from Kafka queue. Order ID: {}", event.orderId());

        try {
            Optional<EventInventory> seatQuery = inventoryRepository
                    .findByEventIdAndSeatId(event.eventId(), event.seatId());

            if (seatQuery.isPresent()) {
                EventInventory seat = seatQuery.get();

                if ("AVAILABLE".equals(seat.getStatus())) {
                    seat.setStatus("SOLD");
                    inventoryRepository.save(seat);
                    log.info("Inventory status successfully marked as SOLD for seat: {}", event.seatId());

                    TicketOrder permanentOrder = new TicketOrder(
                            event.orderId(),
                            event.userId(),
                            event.eventId(),
                            event.seatId(),
                            "CONFIRMED",
                            event.createdAt(),
                            Instant.now()
                    );
                    orderRepository.save(permanentOrder);
                    log.info("Permanent database transaction finalized for Order: {}", event.orderId());

                } else {
                    log.warn("Database conflict: Seat {} is already marked as {}. Over-booking rejected.",
                            event.seatId(), seat.getStatus());
                    handleFailedOrder(event, "SEAT_ALREADY_TAKEN");
                }
            } else {
                log.error("Invalid Event/Seat identifier target parsed: {} - {}", event.eventId(), event.seatId());
                handleFailedOrder(event, "INVALID_SEAT");
            }

        } catch (org.springframework.orm.ObjectOptimisticLockingFailureException ex) {
            log.error("Optimistic locking crash detected! Another consumer modified version data first for seat: {}", event.seatId());
            handleFailedOrder(event, "CONCURRENCY_FAIL");
        } catch (Exception ex) {
            log.error("Fulfillment engine breakdown processing event order: {}", event.orderId(), ex);
            handleFailedOrder(event, "SYSTEM_ERROR");
        }
    }

    private void handleFailedOrder(TicketOrderEvent event, String reason) {
        TicketOrder failedOrder = new TicketOrder(
                event.orderId(),
                event.userId(),
                event.eventId(),
                event.seatId(),
                "FAILED_" + reason,
                event.createdAt(),
                Instant.now()
        );
        orderRepository.save(failedOrder);
    }
}
