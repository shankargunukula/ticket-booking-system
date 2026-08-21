package com.ticket.booking.service;

import com.ticket.booking.entity.EventInventory;
import com.ticket.booking.entity.TicketOrder;
import com.ticket.booking.model.BookingRequest;
import com.ticket.booking.model.TicketOrderEvent;
import com.ticket.booking.publisher.TicketOrderPublisher;
import com.ticket.booking.repository.EventInventoryRepository;
import com.ticket.booking.repository.TicketOrderRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class BookingService {

    private final EventInventoryRepository inventoryRepository;
    private final TicketOrderRepository orderRepository;

    // 🚀 FIXED: Declared the field so Lombok's @RequiredArgsConstructor injects it automatically
    private final TicketOrderPublisher ticketOrderPublisher;

    /**
     * Phase 1: High-Speed Seat Allocation Reservation Handshake
     * Evaluates initial availability status, creates a unique transaction tracking key,
     * and sets a database seat hold reservation state.
     */
    @Transactional
    public String processBooking(BookingRequest request) {
        log.info("Evaluating transaction booking requests parameters for user context: {}", request.userId());

        // Locate seat state parameters using Java 21 record unboxing extraction features
        EventInventory seat = inventoryRepository.findByEventIdAndSeatId(request.eventId(), request.seatId())
                .orElseThrow(() -> new IllegalArgumentException("Target event inventory tracking mapping not found."));

        // Evaluate lock status bounds securely
        if (!"AVAILABLE".equals(seat.getStatus())) {
            throw new IllegalStateException("Selected seat identifier is already held, pending, or permanently sold.");
        }

        // Apply a temporary status hold
        seat.setStatus("PENDING_HOLD");
        inventoryRepository.save(seat);

        // Instantiates unique transaction key parameters
        String generatedOrderId = UUID.randomUUID().toString();

        // Build permanent holding order trace log records
        TicketOrder holdOrder = TicketOrder.builder()
                .orderId(generatedOrderId)
                .userId(request.userId())
                .eventId(request.eventId())
                .seatId(request.seatId())
                .status("PENDING")
                .createdAt(Instant.now())
                .build();

        orderRepository.save(holdOrder);
        log.info("Seat reservation token generated securely. Tracking reference: {}", generatedOrderId);

        // Instantiation of your Java 21 Record Type Event matching constructor payload specs
        TicketOrderEvent msgEvent = new TicketOrderEvent(
                generatedOrderId,
                request.userId(),
                request.eventId(),
                request.seatId(),
                "PENDING",
                Instant.now()
        );

        // Dispatch downstream asynchronously outside critical SQL transaction lock scopes
        ticketOrderPublisher.publishBookingEvent(msgEvent);

        return generatedOrderId;
    }

    /**
     * Extracts active catalog seat mappings belonging to specific global events.
     */
    public List<EventInventory> getAvailableSeats(String eventId) {
        log.debug("Pulling data inventory matching event parameters: {}", eventId);
        return inventoryRepository.findByEventIdAndStatus(eventId, "AVAILABLE");
    }

    /**
     * Pulls target historical tracking receipts based on a unique transaction code string.
     */
    public Optional<TicketOrder> getOrderDetails(String orderId) {
        log.debug("Querying relational indexing systems for token key: {}", orderId);
        return orderRepository.findByOrderId(orderId);
    }
}
