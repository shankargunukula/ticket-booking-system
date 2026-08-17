package com.ticket.booking.repository;

import com.ticket.booking.entity.EventInventory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface EventInventoryRepository extends JpaRepository<EventInventory, Long> {
    // Looks for eventId and seatId properties in the entity class
    Optional<EventInventory> findByEventIdAndSeatId(String eventId, String seatId);

    // Looks for eventId and status properties in the entity class
    List<EventInventory> findByEventIdAndStatus(String eventId, String status);
}
