package com.ticket.booking.service;

import com.ticket.booking.config.KafkaConfig;
import com.ticket.booking.entity.EventInventory;
import com.ticket.booking.entity.TicketOrder;
import com.ticket.booking.model.BookingRequest;
import com.ticket.booking.model.TicketOrderEvent;
import com.ticket.booking.repository.EventInventoryRepository;
import com.ticket.booking.repository.TicketOrderRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
public class BookingService {

    @Autowired
    private RedisTemplate<String, Object> redisTemplate;

    @Autowired
    private KafkaTemplate<String, Object> kafkaTemplate;

    // 🌟 FIX: Ensure BOTH database repositories are cleanly autowired here
    @Autowired
    private EventInventoryRepository inventoryRepository;

    @Autowired
    private TicketOrderRepository orderRepository;

    private static final String LOCK_PREFIX = "lock:event:%s:seat:%s";

    /**
     * Handles fast distributed reservation seat holding via Redis caches
     */
    public String processBooking(BookingRequest request) throws IllegalStateException {
        String lockKey = String.format(LOCK_PREFIX, request.getEventId(), request.getSeatId());
        String uniqueOrderId = UUID.randomUUID().toString();

        Boolean lockAcquired = redisTemplate.opsForValue()
                .setIfAbsent(lockKey, uniqueOrderId, Duration.ofMinutes(10));

        if (Boolean.TRUE.equals(lockAcquired)) {
            TicketOrderEvent orderEvent = new TicketOrderEvent(
                    uniqueOrderId,
                    request.getUserId(),
                    request.getEventId(),
                    request.getSeatId(),
                    "PENDING_PAYMENT",
                    Instant.now()
            );

            kafkaTemplate.send(KafkaConfig.BOOKING_TOPIC, uniqueOrderId, orderEvent);
            return uniqueOrderId;
        } else {
            throw new IllegalStateException("Seat is already reserved by another user!");
        }
    }

    /**
     * API Fetching Logic: Retreive available seat arrays from database
     */
    public List<EventInventory> getAvailableSeats(String eventId) {
        return inventoryRepository.findByEventIdAndStatus(eventId, "AVAILABLE");
    }

    /**
     * API Fetching Logic: Tracking transaction status histories via order uuid references
     */
    public Optional<TicketOrder> getOrderDetails(String orderId) {
        return orderRepository.findById(orderId);
    }
}
