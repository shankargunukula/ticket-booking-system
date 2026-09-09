package com.ticket.booking.repository;

import com.ticket.booking.entity.Movie;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MovieRepository extends JpaRepository<Movie, String> {

    /**
     * Searches for movies matching a title string fragment while scanning 
     * inside the child @ElementCollection table array for the requested city.
     *
     * @param title Fragment of the movie title (Case-Insensitive)
     * @param city  Exact name string of the city location (Case-Insensitive)
     * @return A list of matching Movie entities
     */
    List<Movie> findByTitleContainingIgnoreCaseAndCitiesContainingIgnoreCase(
            String title,
            String city
    );
}
