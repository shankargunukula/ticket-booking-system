package com.ticket.booking.service;

import com.ticket.booking.entity.Movie;
import com.ticket.booking.model.MovieSearchInput;
import com.ticket.booking.repository.MovieRepository;
import jakarta.persistence.criteria.Join;
import jakarta.persistence.criteria.Predicate;
import org.springframework.stereotype.Service;
import java.util.ArrayList;
import java.util.List;

@Service
public class MovieService {

    private final MovieRepository movieRepository;

    public MovieService(MovieRepository movieRepository) {
        this.movieRepository = movieRepository;
    }

    public List<Movie> searchMovies(MovieSearchInput filter) {
        return movieRepository.findAll((root, query, criteriaBuilder) -> {
            List<Predicate> predicates = new ArrayList<>();

            if (filter.title() != null && !filter.title().isBlank() && !filter.title().equalsIgnoreCase("none")) {
                predicates.add(criteriaBuilder.like(root.get("title"), "%" + filter.title() + "%"));
            }

            if (filter.city() != null && !filter.city().isBlank() && !filter.city().equalsIgnoreCase("none")) {
                // Your custom join definition to 'movie_cities' table goes here
                Join<Object, Object> cityJoin = root.join("cities");
                predicates.add(criteriaBuilder.equal(cityJoin, filter.city()));
            }

            if (filter.date() != null && !filter.date().isBlank() && !filter.date().equalsIgnoreCase("none")) {
                predicates.add(criteriaBuilder.equal(root.get("date"), filter.date()));
            }

            // Returns an empty or combined condition predicate array safely
            return criteriaBuilder.and(predicates.toArray(new Predicate[0]));
        });
    }
}
