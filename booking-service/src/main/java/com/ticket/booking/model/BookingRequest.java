package com.ticket.booking.model;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

/**
 * Java 21 Record representation mapping incoming transaction payloads securely.
 */
public record BookingRequest(
        @NotBlank(message = "Movie ID parameter is mandatory") String movieId,
        @NotBlank(message = "Movie title is mandatory") String movieTitle,
        @NotBlank(message = "Showtime slot string must be specified") String selectedShowtime,
        @NotNull @Min(1) Integer ticketsPurchased,
        @NotNull @Min(0) Double totalCharged,
        @NotBlank String maskedCard
) {
}

