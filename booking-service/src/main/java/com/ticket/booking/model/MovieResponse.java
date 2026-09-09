package com.ticket.booking.model;

import java.util.List;

public class MovieResponse {
    private List<String> showtimes;
    private List<String> genres;
    private double rating;
    private String ticket_price;

    // Constructors
    public MovieResponse() {}

    public MovieResponse(List<String> showtimes, List<String> genres, double rating, String ticketPrice) {
        this.showtimes = showtimes;
        this.genres = genres;
        this.rating = rating;
        this.ticket_price = ticketPrice;
    }

    // Getters and Setters
    public List<String> getShowtimes() { return showtimes; }
    public void setShowtimes(List<String> showtimes) { this.showtimes = showtimes; }

    public List<String> getGenres() { return genres; }
    public void setGenres(List<String> genres) { this.genres = genres; }

    public double getRating() { return rating; }
    public void setRating(double rating) { this.rating = rating; }

    public String getTicket_price() { return ticket_price; }
    public void setTicket_price(String ticketPrice) { this.ticket_price = ticketPrice; }
}

