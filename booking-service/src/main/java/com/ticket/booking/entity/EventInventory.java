package com.ticket.booking.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.math.BigDecimal;

@Entity
// 🌟 FIX: Force mapping to the 'public' schema and match table naming exactly
@Table(name = "event_inventory", schema = "public", uniqueConstraints = {
        @UniqueConstraint(columnNames = {"event_id", "seat_id"})
})
@Data
@NoArgsConstructor
@AllArgsConstructor
public class EventInventory {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // 🌟 FIX: Map camelCase Java fields to snake_case PostgreSQL columns
    @Column(name = "event_id", nullable = false)
    private String eventId;

    @Column(name = "seat_id", nullable = false)
    private String seatId;

    @Column(name = "price", nullable = false)
    private BigDecimal price;

    @Column(name = "status", nullable = false)
    private String status;

    @Version
    @Column(name = "version")
    private Long version;
}
