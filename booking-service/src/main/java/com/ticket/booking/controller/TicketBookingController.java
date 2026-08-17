package com.ticket.booking.controller;

import com.ticket.booking.entity.EventInventory; // 🌟 ADDED: Entity import for type safety
import com.ticket.booking.model.BookingRequest;
import com.ticket.booking.service.BookingService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List; // 🌟 FIXED: Missing import that caused [31,9] crash
import java.util.Map;

@RestController
@RequestMapping("/api/v1/bookings")
public class TicketBookingController {

    @Autowired
    private BookingService bookingService;

    @PostMapping
    public ResponseEntity<Map<String, String>> createBooking(@RequestBody BookingRequest request) {
        try {
            String orderId = bookingService.processBooking(request);
            return ResponseEntity.status(HttpStatus.ACCEPTED).body(Map.of(
                    "status", "SUCCESS",
                    "message", "Seat held for 10 minutes.",
                    "orderId", orderId
            ));
        } catch (IllegalStateException ex) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body(Map.of(
                    "status", "FAILED",
                    "message", ex.getMessage()
            ));
        } catch (Exception ex) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of(
                    "status", "ERROR",
                    "message", "Internal processing breakdown."
            ));
        }
    }

    // 🌟 FIXED: Added proper collection mapping type tags
    @GetMapping("/event/{eventId}/seats")
    public ResponseEntity<List<EventInventory>> getAvailableSeats(@PathVariable String eventId) {
        List<EventInventory> seats = bookingService.getAvailableSeats(eventId);
        return ResponseEntity.ok(seats);
    }

    @GetMapping("/order/{orderId}")
    public ResponseEntity<?> getOrderDetails(@PathVariable String orderId) {
        return bookingService.getOrderDetails(orderId)
                .<ResponseEntity<?>>map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(Map.of("status", "ERROR", "message", "Order tracking reference not found.")));
    }
}
