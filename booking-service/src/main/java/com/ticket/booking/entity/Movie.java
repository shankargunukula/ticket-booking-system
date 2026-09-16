package com.ticket.booking.entity;

import jakarta.persistence.*;
import lombok.Data;

import java.util.List;

@Entity
@Table(name = "movies")
@Data
public class Movie {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private String id;

    private String title;
    private String genre;
    private Double rating;

    @Column(columnDefinition = "TEXT")
    private String synopsis;

    private String bannerUrl;
    private Double ticketPrice;

    // 🛠️ FIX 1: Explicitly force Eager Loading on the Cities List array
    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "movie_cities", joinColumns = @JoinColumn(name = "movie_id"))
    @Column(name = "city_name")
    private List<String> cities;

    // 🛠️ FIX 2: Explicitly force Eager Loading on the Showtimes List array
    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "movie_showtimes", joinColumns = @JoinColumn(name = "movie_id"))
    @Column(name = "showtimes") // 🚀 Explicitly maps to the column name in your DB
    private List<String> showtimes;

    // 🛠️ FIX 3: Explicitly force Eager Loading on the ShowDates List array (Missing column fix)
    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "movie_show_dates", joinColumns = @JoinColumn(name = "movie_id"))
    @Column(name = "show_date")
    private List<String> showDates;

    // --- Standard No-Args Constructor ---
    public Movie() {}


}
