package com.ticket.booking.entity;

import jakarta.persistence.*;
import lombok.Data;

import java.util.List;

@Entity
@Table(name = "movies")
@Data
public class Movie {
    @Id
    private String id;

    @Column(nullable = false)
    private String title;

    @Column(nullable = false)
    private String genre;

    private Double rating;

    @Column(columnDefinition = "TEXT")
    private String synopsis;

    private String bannerUrl;

    @Column(nullable = false)
    private Double ticketPrice;

    @ElementCollection
    @CollectionTable(name = "movie_cities", joinColumns = @JoinColumn(name = "movie_id"))
    @Column(name = "city_name")
    private List<String> cities;

    @ElementCollection
    @CollectionTable(name = "movie_showtimes", joinColumns = @JoinColumn(name = "movie_id"))
    @Column(name = "showtime_string")
    private List<String> showtimes;

    // Standard Java 21 Empty Constructor
    public Movie() {}

}
