package com.ticket.booking.repository;

import com.ticket.booking.entity.Movie;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;

public interface MovieRepository extends JpaRepository<Movie, String> {

    @Query("SELECT DISTINCT m FROM Movie m " +
            "JOIN m.cities c " +
            "JOIN m.showDates d " +
            "WHERE LOWER(m.title) LIKE LOWER(CONCAT('%', :title, '%')) " +
            "AND LOWER(c) = LOWER(:city) " +
            "AND d = :date")
    List<Movie> findMoviesByFilters(
            @Param("title") String title,
            @Param("city") String city,
            @Param("date") String date
    );
}
