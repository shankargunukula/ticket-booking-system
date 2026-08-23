package com.ticket.booking.consumer;

import com.ticket.booking.entity.Booking;
import com.ticket.booking.model.TicketOrderEvent;
import com.ticket.booking.repository.BookingRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Component
public class TicketOrderConsumer {

    private static final Logger logger = LoggerFactory.getLogger(TicketOrderConsumer.class);
    private final BookingRepository bookingRepository;

    public TicketOrderConsumer(BookingRepository bookingRepository) {
        this.bookingRepository = bookingRepository;
    }

    /**
     * Asynchronous transaction listener block polling the event queue stream.
     * Enforces transactional boundaries to ensure database writes are atomic.
     */
    @KafkaListener(
            topics = "ticket-orders-topic",
            groupId = "ticket-booking-consumer-group",
            containerFactory = "kafkaListenerContainerFactory" // Standard config connection identifier string mapping
    )
    @Transactional
    public void consumeTicketOrder(@Payload TicketOrderEvent event) {
        logger.info("Inbound payload event received from message queue broker channel. Processing ID: {}", event.transactionId());

        try {
            // 1. Process explicit business rules verification (e.g. anti-fraud checking, inventory reductions) here

            // 2. Map the modern Java 21 Record elements cleanly onto your persistent PostgreSQL entity
            Booking databaseBookingRow = new Booking();

            // Using your auto-generated transaction identifier code as reference keys if desired
            databaseBookingRow.setMovieId(event.movieId());
            databaseBookingRow.setMovieTitle(event.movieTitle());
            databaseBookingRow.setSelectedShowtime(event.selectedShowtime());
            databaseBookingRow.setTicketsPurchased(event.ticketsPurchased());
            databaseBookingRow.setTotalCharged(event.totalCharged());
            databaseBookingRow.setMaskedCard(event.maskedCard());
            databaseBookingRow.setCreatedAt(LocalDateTime.now());

            // 3. Commit state changes permanently to disk
            Booking savedEntity = bookingRepository.save(databaseBookingRow);

            logger.info("Persistent storage commit complete. Record generated in PostgreSQL with Table primary Key ID: {}",
                    savedEntity.getId());

        } catch (Exception exception) {
            logger.error("Exception encountered during relational mapping processing execution for transaction record: {}",
                    event.transactionId(), exception);
            // Throwing forces a rollback inside @Transactional bounds, preventing corrupt data states
            throw exception;
        }
    }
}
