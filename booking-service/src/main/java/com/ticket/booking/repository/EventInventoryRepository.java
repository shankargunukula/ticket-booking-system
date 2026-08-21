package com.ticket.booking.repository;

import com.ticket.booking.entity.EventInventory;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface EventInventoryRepository extends JpaRepository<EventInventory, Long> {
    Optional<EventInventory> findByEventIdAndSeatId(String eventId, String seatId);
    List<EventInventory> findByEventIdAndStatus(String eventId, String status);
}
