-- Clean up any leftover records to ensure fresh testing data
TRUNCATE TABLE event_inventory CASCADE;

-- Generate 1,000 Mock Seats (10 rows named A through J, with 100 seats each)
INSERT INTO event_inventory (event_id, seat_id, price, status, version)
SELECT
    'concert_rock_2026' AS event_id,
    -- Creates seat designations like 'Row-A-Seat-001' up to 'Row-J-Seat-100'
    'Row-' || chr(65 + (row_num % 10)) || '-Seat-' || LPAD(seat_num::text, 3, '0') AS seat_id,
    -- Allocates $250.00 for Rows A-C (VIP), and $120.00 for subsequent rows
    CASE
        WHEN chr(65 + (row_num % 10)) IN ('A', 'B', 'C') THEN 250.00
        ELSE 120.00
    END AS price,
    'AVAILABLE' AS status,
    0 AS version
FROM
    generate_series(0, 9) AS row_num,     -- 10 Rows (A to J using ASCII 65)
    generate_series(1, 100) AS seat_num;  -- 100 Seats per row (10 * 100 = 1000)
