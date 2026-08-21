package com.ticket.booking.repository;

import com.ticket.booking.entity.TicketOrder;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface TicketOrderRepository extends JpaRepository<TicketOrder, Long> {
    List<TicketOrder> findByUserMobile(String userMobile);
    Optional<TicketOrder> findByOrderId(String orderId);
}
