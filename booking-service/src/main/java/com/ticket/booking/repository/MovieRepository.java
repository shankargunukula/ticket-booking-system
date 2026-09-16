package com.ticket.booking.repository;

import com.ticket.booking.entity.Movie;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

@Repository
public interface MovieRepository extends JpaRepository<Movie, String>, JpaSpecificationExecutor<Movie> {
    // You don't need to add any manual search methods here!
    // JpaSpecificationExecutor automatically gives you the .findAll(Specification) method
    // used inside your MovieService.
}
