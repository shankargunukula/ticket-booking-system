package com.ticket.booking.model;

import java.io.Serializable;
import java.time.Instant;

public record TicketOrderEvent(
        String orderId,
        String userId,
        String eventId,
        String seatId,
        String status,
        Instant createdAt
) implements Serializable {}
