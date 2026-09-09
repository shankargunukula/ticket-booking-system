package com.ticket.booking.controller;

import com.ticket.booking.entity.Movie;
import com.ticket.booking.repository.MovieRepository;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@RestController
@RequestMapping("/api/v1/movies")
@CrossOrigin(origins = "*", allowedHeaders = "*")
public class MoviesController {

    private final MovieRepository movieRepository;

    // Java 21 Constructor Dependency Injection
    public MoviesController(MovieRepository movieRepository) {
        this.movieRepository = movieRepository;
    }

    /**
     * Unified Endpoint Routing:
     * 1. GET /api/v1/movies -> Returns a List of all movies.
     * 2. GET /api/v1/movies?title=...&city=...&date=... -> Returns a single filtered Movie.
     */
    @GetMapping
    public ResponseEntity<?> getMovies(
            @RequestParam(value = "title", required = false) String title,
            @RequestParam(value = "city", required = false) String city,
            @RequestParam(value = "date", required = false) String date) {

        // Scenario 1: No query filters passed -> Return all movies in catalog
        if (title == null && city == null && date == null) {
            List<Movie> allMovies = movieRepository.findAll();
            return ResponseEntity.ok(allMovies);
        }

        // Scenario 2: Search filters passed -> Enforce complete AI parameter contract
        if (title == null || city == null || date == null) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Searching requires 'title', 'city', and 'date' parameters."
            );
        }

        System.out.println("[Java Service Log] Query execution: Title=" + title + ", City=" + city + ", Date=" + date);

        // Normalize text layout parameters safely
        String cleanTitle = title.trim();
        String cleanCity = city.trim();

        // Query records by Title and check against the child elements Collection Table
        List<Movie> matchedMovies = movieRepository.findByTitleContainingIgnoreCaseAndCitiesContainingIgnoreCase(
                cleanTitle, cleanCity
        );

        // Throw structured 404 block to suppress extra text generation on downstream agent layers
        if (matchedMovies.isEmpty()) {
            throw new ResponseStatusException(
                    HttpStatus.NOT_FOUND,
                    "No active movie listings found matching your request for '" + title + "' in " + city + "."
            );
        }

        // Return the individual record matching the criteria
        Movie matchedMovie = matchedMovies.get(0);
        return ResponseEntity.ok(matchedMovie);
    }
}
