-- 1. Create Movies Target Master Table
CREATE TABLE movies (
    id VARCHAR(50) PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    genre VARCHAR(100) NOT NULL,
    rating NUMERIC(3, 1) CHECK (rating >= 0.0 AND rating <= 10.0),
    synopsis TEXT,
    banner_url TEXT,
    ticket_price NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. Create Cities Mapping Table (Normalizes the multi-city array pattern)
CREATE TABLE movie_cities (
    id SERIAL PRIMARY KEY,
    movie_id VARCHAR(50) REFERENCES movies(id) ON DELETE CASCADE,
    city_name VARCHAR(100) NOT NULL,
    UNIQUE(movie_id, city_name)
);

-- 3. Create Showtimes Mapping Table (Normalizes individual slot segments)
CREATE TABLE movie_showtimes (
    id SERIAL PRIMARY KEY,
    movie_id VARCHAR(50) REFERENCES movies(id) ON DELETE CASCADE,
    showtime_string VARCHAR(20) NOT NULL
);

-- 4. Create Ledger Bookings Transactions Table
CREATE TABLE bookings (
    id SERIAL PRIMARY KEY,
    movie_id VARCHAR(50) REFERENCES movies(id) ON DELETE RESTRICT,
    movie_title VARCHAR(255) NOT NULL,
    selected_showtime VARCHAR(20) NOT NULL,
    tickets_purchased INT NOT NULL CHECK (tickets_purchased > 0),
    subtotal NUMERIC(10, 2) NOT NULL,
    processing_fees NUMERIC(10, 2) NOT NULL,
    total_charged NUMERIC(10, 2) NOT NULL,
    masked_card VARCHAR(25) NOT NULL,
    expiry_date VARCHAR(5) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ================= PERFORMANCE TUNING INDEX TRACKERS =================
CREATE INDEX idx_movies_genre ON movies(genre);
CREATE INDEX idx_movie_cities_name ON movie_cities(city_name);
CREATE INDEX idx_bookings_movie_id ON bookings(movie_id);



-- Populate Primary Movie Assets Matrix
INSERT INTO movies (id, title, genre, rating, synopsis, banner_url, ticket_price) VALUES
('mv-101', 'Inception', 'Sci-Fi', 8.8, 'A thief who steals corporate secrets through the use of dream-sharing technology...', 'https://unsplash.com', 14.50),
('mv-102', 'The Dark Knight', 'Action', 9.0, 'When the menace known as the Joker wreaks havoc and chaos on the people of Gotham...', 'https://unsplash.com', 16.00),
('mv-103', 'La La Land', 'Romance', 8.0, 'While navigating their careers in Los Angeles, a pianist and an actress fall in love...', 'https://unsplash.com', 12.00),
('mv-104', 'Pulp Fiction', 'Crime', 8.9, 'The lives of two mob hitmen, a boxer, a gangster and his wife intertwine...', 'https://unsplash.com', 13.50),
('mv-105', 'The Departed', 'Thriller', 8.5, 'An undercover cop and a mole in the police force attempt to identify each other...', 'https://unsplash.com', 14.00),
('mv-106', 'Interstellar', 'Sci-Fi', 8.7, 'When Earth becomes uninhabitable, a team of explorers travels through a wormhole...', 'https://unsplash.com', 15.00);

-- Populate Regional Location Mapping Links
INSERT INTO movie_cities (movie_id, city_name) VALUES
('mv-101', 'New York'), ('mv-101', 'Los Angeles'), ('mv-101', 'Chicago'),
('mv-102', 'New York'), ('mv-102', 'Chicago'),
('mv-103', 'Los Angeles'),
('mv-104', 'Los Angeles'), ('mv-104', 'New York'),
('mv-105', 'Boston'), ('mv-105', 'Chicago'),
('mv-106', 'Boston'), ('mv-106', 'New York');

-- Populate Showtime Slots Availability
INSERT INTO movie_showtimes (movie_id, showtime_string) VALUES
('mv-101', '10:30 AM'), ('mv-101', '2:15 PM'), ('mv-101', '7:00 PM'),
('mv-102', '1:00 PM'), ('mv-102', '8:30 PM'), ('mv-102', '11:00 PM'),
('mv-103', '11:00 AM'), ('mv-103', '4:30 PM'),
('mv-104', '6:00 PM'), ('mv-104', '9:30 PM'),
('mv-105', '3:00 PM'), ('mv-105', '7:45 PM'),
('mv-106', '12:00 PM'), ('mv-106', '8:00 PM');

-- Populate Sample Booking Checkout Entry
INSERT INTO bookings (movie_id, movie_title, selected_showtime, tickets_purchased, subtotal, processing_fees, total_charged, masked_card, expiry_date) VALUES
('mv-101', 'Inception', '2:15 PM', 2, 29.00, 1.50, 30.50, 'xxxx-xxxx-xxxx-4321', '12/28');



SELECT
    m.id, m.title, m.genre, m.rating, m.synopsis, m.banner_url, m.ticket_price AS "ticketPrice",
    ARRAY_TO_JSON(ARRAY_AGG(DISTINCT c.city_name)) AS cities,
    ARRAY_TO_JSON(ARRAY_AGG(DISTINCT s.showtime_string)) AS showtimes
FROM movies m
LEFT JOIN movie_cities c ON m.id = c.movie_id
LEFT JOIN movie_showtimes s ON m.id = s.movie_id
GROUP BY m.id;



-- 1. Master Auditorium/Theater Screen Reference Table
CREATE TABLE theater_halls (
    id SERIAL PRIMARY KEY,
    hall_name VARCHAR(50) NOT NULL UNIQUE, -- e.g., 'Screen 1 IMAX', 'Screen 2 Dolby'
    total_capacity INT NOT NULL CHECK (total_capacity > 0)
);

-- 2. Physical Layout Design Matrix (Static Blueprint of a Hall)
CREATE TABLE hall_seats (
    id SERIAL PRIMARY KEY,
    hall_id INT REFERENCES theater_halls(id) ON DELETE CASCADE,
    row_letter VARCHAR(2) NOT NULL,        -- e.g., 'A', 'B', 'C'
    seat_number INT NOT NULL,              -- e.g., 1, 2, 3
    seat_type VARCHAR(20) DEFAULT 'Standard' CHECK (seat_type IN ('Standard', 'Premium', 'VIP', 'Recliner')),
    UNIQUE(hall_id, row_letter, seat_number)
);

-- 3. Live Inventory Scheduler (Links a Movie to a Hall and Showtime)
CREATE TABLE inventory_sessions (
    id SERIAL PRIMARY KEY,
    movie_id VARCHAR(50) NOT NULL,         -- Links back to your 'movies' master table
    hall_id INT REFERENCES theater_halls(id) ON DELETE RESTRICT,
    session_date DATE NOT NULL,
    showtime_string VARCHAR(20) NOT NULL,
    UNIQUE(hall_id, session_date, showtime_string) -- Prevents two movies from playing in the same hall at the same time
);

-- 4. Dynamic Seat Instance State Machine (Tracks every seat for every showtime)
CREATE TABLE session_seats (
    id SERIAL PRIMARY KEY,
    session_id INT REFERENCES inventory_sessions(id) ON DELETE CASCADE,
    seat_id INT REFERENCES hall_seats(id) ON DELETE RESTRICT,
    booking_id INT,                        -- Nullable. Maps back to your 'bookings' primary key when purchased
    occupancy_status VARCHAR(20) DEFAULT 'Available' CHECK (occupancy_status IN ('Available', 'Locked', 'Reserved')),
    locked_until TIMESTAMP WITH TIME ZONE,  -- Used for temporary 5-minute checkout holds
    UNIQUE(session_id, seat_id)
);

-- ================= PERFORMANCE TUNING INDEXES =================
CREATE INDEX idx_session_seats_lookup ON session_seats(session_id, occupancy_status);



-- Step 1: Declare Physical Audit Halls
INSERT INTO theater_halls (hall_name, total_capacity) VALUES
('IMAX Screen 1', 12),
('Dolby Screen 2', 8);

-- Step 2: Set up Row Grid Layouts (Rows A and B for Screen 1)
INSERT INTO hall_seats (hall_id, row_letter, seat_number, seat_type) VALUES
(1, 'A', 1, 'Standard'), (1, 'A', 2, 'Standard'), (1, 'A', 3, 'Standard'), (1, 'A', 4, 'Standard'),
(1, 'B', 1, 'Premium'),  (1, 'B', 2, 'Premium'),  (1, 'B', 3, 'Premium'),  (1, 'B', 4, 'Premium'),
(1, 'C', 1, 'VIP'),      (1, 'C', 2, 'VIP'),      (1, 'C', 3, 'VIP'),      (1, 'C', 4, 'VIP');

-- Step 3: Initialize a Live Movie Screening Event Slot Session
INSERT INTO inventory_sessions (movie_id, hall_id, session_date, showtime_string) VALUES
('mv-101', 1, '2026-08-25', '7:00 PM');

-- Step 4: Generate Live Seat Instances dynamically for that created showtime session
INSERT INTO session_seats (session_id, seat_id, occupancy_status)
SELECT 1, id, 'Available' FROM hall_seats WHERE hall_id = 1;
