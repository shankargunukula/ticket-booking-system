package com.ticket.booking.model;

public record BookingRequest(
        String userId,
        String eventId,
        String seatId,
        Integer requestedSeats,
        String customerNotes
) {}
