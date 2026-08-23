package com.ticket.booking.model;

/**
 * Immutable message contract representation distributed through Kafka event log brokers.
 */
public record TicketOrderEvent(
        String transactionId,
        String movieId,
        String movieTitle,
        String selectedShowtime,
        Integer ticketsPurchased,
        Double totalCharged,
        String maskedCard
) {}
