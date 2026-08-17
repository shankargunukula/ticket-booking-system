package com.ticket.booking.model;
import lombok.Data;

@Data
public class BookingRequest {
    private String userId;
    private String eventId;
    private String seatId;
}
