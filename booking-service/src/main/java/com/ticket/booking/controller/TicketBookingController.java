package com.ticket.booking.controller;

import com.ticket.booking.model.BookingRequest;
import com.ticket.booking.service.BookingService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/v1/bookings") // Aligns accurately to UI Axios configuration
@CrossOrigin(origins = "*", allowedHeaders = "*")
public class TicketBookingController {

    private final BookingService bookingService;

    public TicketBookingController(BookingService bookingService) {
        this.bookingService = bookingService;
    }

    @PostMapping
    public ResponseEntity<?> processTicketBooking(@Valid @RequestBody BookingRequest request) {
        // Leverages underlying Redis lock validations and Kafka publishing sequences
        var confirmationId = bookingService.initiateBookingPipeline(request);

        // Return structured JSON response to React UI client mapping structures
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(Map.of(
                        "id", confirmationId,
                        "status", "PENDING_AUTHORIZATION",
                        "message", "Order queued safely onto async transaction engine."
                ));
    }
}
