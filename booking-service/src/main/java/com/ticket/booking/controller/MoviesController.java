package com.ticket.booking.controller;

import com.ticket.booking.entity.Movie;
import com.ticket.booking.repository.MovieRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/movies") // Explicit mapping alignment
@CrossOrigin(origins = "*", allowedHeaders = "*")
public class MoviesController {

    private final MovieRepository movieRepository;

    // Java 21 Constructor Dependency Injection
    public MoviesController(MovieRepository movieRepository) {
        this.movieRepository = movieRepository;
    }

    @GetMapping
    public ResponseEntity<List<Movie>> getAllMovies() {
        return ResponseEntity.ok(movieRepository.findAll());
    }
}

