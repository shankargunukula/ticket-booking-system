package com.ticket.booking.entity;

import jakarta.persistence.*;
import lombok.Data;

import java.time.LocalDateTime;

@Entity
@Table(name = "bookings")
@Data
public class Booking {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String movieId;

    @Column(nullable = false)
    private String movieTitle;

    @Column(nullable = false)
    private String selectedShowtime;

    @Column(nullable = false)
    private Integer ticketsPurchased;

    @Column(nullable = false)
    private Double totalCharged;

    @Column(nullable = false)
    private String maskedCard;

    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    public Booking() {}

}
