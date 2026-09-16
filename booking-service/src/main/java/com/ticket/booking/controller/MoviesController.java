package com.ticket.booking.controller;

import com.ticket.booking.entity.Movie;
import com.ticket.booking.model.MovieSearchInput;
import com.ticket.booking.repository.MovieRepository;
import com.ticket.booking.service.MovieService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@RestController
@RequestMapping("/api/v1/movies")
@CrossOrigin(origins = "*", allowedHeaders = "*")
public class MoviesController {

    private static final Logger log = LoggerFactory.getLogger(MoviesController.class);
    @Autowired
    private MovieRepository movieRepository;
    @Autowired
    private MovieService movieService;


    /**
     * 1. GET /api/v1/movies
     * Fetch all items in the movie catalog.
     */
    @GetMapping
    public ResponseEntity<List<Movie>> getAllMovies(
            @RequestHeader(value = "X-Authenticated-User", required = false) String username,
            @RequestHeader(value = "X-Authenticated-Roles", required = false) String roles) {

        log.info("🎬 [Booking Service] Fetching movie list. Request forwarded by Gateway User: {} | Roles: {}", username, roles);

        List<Movie> movies = movieRepository.findAll();
        return ResponseEntity.ok(movies);
    }

    /**
     * 2. GET /api/v1/movies/search?title=...&city=...&date=...
     * Explicit isolated filtering route to keep contracts clean.
     */
    @GetMapping("/search")
    public ResponseEntity<List<Movie>> searchMovies(
            @RequestParam(required = false) String title,
            @RequestParam(required = false) String city,
            @RequestParam(required = false) String date) {

        // Package parameters into the Search Input record
        MovieSearchInput filter = new MovieSearchInput(title, city, date);

        List<Movie> results = movieService.searchMovies(filter);
        return ResponseEntity.ok(results);
    }

    /**
     * 3. GET /api/v1/movies/{id}
     * Get a single movie record by primary key ID.
     */
    @GetMapping("/{id}")
    public ResponseEntity<Movie> getMovieById(@PathVariable("id") String id) {
        Movie movie = movieRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Movie record not found."));
        return ResponseEntity.ok(movie);
    }

    /**
     * 4. POST /api/v1/movies
     * Add a completely new movie tracking record payload to the system catalog.
     */
    @PostMapping
    public ResponseEntity<Movie> createMovie(@RequestBody Movie movie) {
        if (movie.getId() == null || movie.getId().isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Unique Movie structural ID is mandatory.");
        }
        Movie savedMovie = movieRepository.save(movie);
        return ResponseEntity.status(HttpStatus.CREATED).body(savedMovie);
    }

    /**
     * 5. PUT /api/v1/movies/{id}
     * Full updates/replacements on existing record schema contents.
     */
    @PutMapping("/{id}")
    public ResponseEntity<Movie> updateMovie(@PathVariable("id") String id, @RequestBody Movie movieDetails) {
        Movie existingMovie = movieRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Cannot update non-existent movie resource."));

        // Map payload changes across columns cleanly
        existingMovie.setTitle(movieDetails.getTitle());
        existingMovie.setGenre(movieDetails.getGenre());
        existingMovie.setRating(movieDetails.getRating());
        existingMovie.setSynopsis(movieDetails.getSynopsis());
        existingMovie.setBannerUrl(movieDetails.getBannerUrl());
        existingMovie.setTicketPrice(movieDetails.getTicketPrice());
        existingMovie.setCities(movieDetails.getCities());
        existingMovie.setShowtimes(movieDetails.getShowtimes());
        existingMovie.setShowDates(movieDetails.getShowDates()); // Set tracking operational dates

        Movie updatedMovie = movieRepository.save(existingMovie);
        return ResponseEntity.ok(updatedMovie);
    }

    /**
     * 6. DELETE /api/v1/movies/{id}
     * Completely wipe a movie structural entity listing out of tracking indexes.
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteMovie(@PathVariable("id") String id) {
        Movie existingMovie = movieRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Target resource target already absent."));

        movieRepository.delete(existingMovie);
        return ResponseEntity.noContent().build(); // Standard 204 No Content clean payload structure
    }
}
