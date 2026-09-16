package com.ticket.booking.service;


import com.ticket.booking.entity.Movie;
import com.ticket.booking.model.MovieSearchInput;
import com.ticket.booking.repository.MovieRepository;
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

            // 1. Condition: Title is present
            if (filter.title() != null && !filter.title().isBlank()) {
                predicates.add(criteriaBuilder.like(root.get("title"), "%" + filter.title() + "%"));
            }

            // 2. Condition: City is also present
            if (filter.city() != null && !filter.city().isBlank()) {
                predicates.add(criteriaBuilder.equal(root.get("city"), filter.city()));
            }

            // 3. Condition: Date is also present
            if (filter.date() != null && !filter.date().isBlank()) {
                predicates.add(criteriaBuilder.equal(root.get("date"), filter.date()));
            }

            // Fallback: If no filters are passed, return all records
            return criteriaBuilder.and(predicates.toArray(new Predicate[0]));
        });
    }
}
