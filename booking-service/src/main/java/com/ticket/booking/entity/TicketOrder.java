package com.ticket.booking.entity;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import java.time.Instant;

@Entity
@Table(name = "ticket_order", schema = "public")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TicketOrder {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String orderId;
    private String userId;
    private String eventId;
    private String seatId;
    private String userMobile;
    private String eventName;
    private String status;
    private Instant createdAt;
    private Instant finalizedAt;

    // Custom constructor matching Kafka consumer signature parameters
    public TicketOrder(String orderId, String userId, String eventId, String seatId, String status, Instant createdAt, Instant finalizedAt) {
        this.orderId = orderId;
        this.userId = userId;
        this.eventId = eventId;
        this.seatId = seatId;
        this.status = status;
        this.createdAt = createdAt;
        this.finalizedAt = finalizedAt;
    }
}
