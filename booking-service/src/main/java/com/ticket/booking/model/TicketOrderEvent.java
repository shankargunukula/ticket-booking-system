package com.ticket.booking.model;
import lombok.AllArgsConstructor;
import lombok.Data;
import java.io.Serializable;
import java.time.Instant;

@Data
@AllArgsConstructor
public class TicketOrderEvent implements Serializable {
    private String orderId;
    private String userId;
    private String eventId;
    private String seatId;
    private String status;
    private Instant createdAt;
}
