package com.ticket.booking.service;

import com.ticket.booking.model.BookingRequest;
import com.ticket.booking.model.TicketOrderEvent;
import com.ticket.booking.publisher.TicketOrderPublisher;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.http.HttpStatus;

import java.time.Duration;
import java.util.UUID;

@Service
public class BookingService {

    private final StringRedisTemplate redisTemplate;
    private final TicketOrderPublisher orderPublisher;

    public BookingService(StringRedisTemplate redisTemplate, TicketOrderPublisher orderPublisher) {
        this.redisTemplate = redisTemplate;
        this.orderPublisher = orderPublisher;
    }

    public String initiateBookingPipeline(BookingRequest request) {
        // 1. Generate unique transactional traceability code identifiers
        String transactionalId = UUID.randomUUID().toString();

        // 2. Structural loop enforcing distributed lock evaluation in Redis memory clusters
        String redisSeatLockKey = "lock:session:" + request.selectedShowtime() + ":seat:" + request.movieId();

        // Atomic operations evaluating memory availability thresholds
        Boolean lockAcquired = redisTemplate.opsForValue().setIfAbsent(
                redisSeatLockKey,
                transactionalId,
                Duration.ofMinutes(5) // Auto-expiry configuration safeguards system bounds
        );

        if (Boolean.FALSE.equals(lockAcquired)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Target seat allocation elements are locked by another consumer session.");
        }

        // 3. Construct modern Java 21 Record mapping structures payload context
        var outboundEvent = new TicketOrderEvent(
                transactionalId,
                request.movieId(),
                request.movieTitle(),
                request.selectedShowtime(),
                request.ticketsPurchased(),
                request.totalCharged(),
                request.maskedCard()
        );

        // 4. Dispatch records outward downstream via decoupled publisher engine
        orderPublisher.sendTicketOrderToBroker(outboundEvent);

        return transactionalId;
    }
}
