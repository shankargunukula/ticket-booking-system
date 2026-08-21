package com.ticket.booking.controller;

import com.ticket.booking.entity.EventInventory;
import com.ticket.booking.entity.TicketOrder;
import com.ticket.booking.model.BookingRequest;
import com.ticket.booking.repository.TicketOrderRepository;
import com.ticket.booking.service.BookingService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;

@Slf4j
@RestController
@RequestMapping("/api/v1/bookings")
@RequiredArgsConstructor
public class TicketBookingController {

    private final BookingService bookingService;
    private final TicketOrderRepository ticketRepository;

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

    @GetMapping("/my-tickets")
    public ResponseEntity<List<TicketOrder>> getMyTickets(
            @RequestHeader("X-Authenticated-User-Mobile") String loggedInUserMobile) {
        log.info("Querying available system ticket instances for user: {}", loggedInUserMobile);
        List<TicketOrder> userTickets = ticketRepository.findByUserMobile(loggedInUserMobile);
        return ResponseEntity.ok(userTickets);
    }
}
