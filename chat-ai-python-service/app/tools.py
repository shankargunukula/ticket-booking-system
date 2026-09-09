import json
from langchain_core.tools import tool

@tool
def search_movie_showtimes(movie_title: str, city: str, date: str) -> str:
    """
    Searches the theater registry for available showtimes, screening formats, and seat availability.
    Use this whenever a user asks about movie schedules, theater locations, or ticket prices.

    Args:
        movie_title: The name of the movie (e.g., 'Inception', 'The Dark Knight').
        city: The target city location (e.g., 'Chicago', 'New York').
        date: The target date in YYYY-MM-DD format.
    """
    # Mocking database response based on your active UI layout
    print(f"[Tool Log] Searching catalog for {movie_title} in {city}...")

    movie_db = {
        "inception": {
            "showtimes": ["10:30 AM", "2:15 PM", "7:00 PM"],
            "genres": ["Sci-Fi"],
            "rating": 8.8,
            "ticket_price": "$14.50"
        },
        "the dark knight": {
            "showtimes": ["1:00 PM", "8:30 PM", "11:00 PM"],
            "genres": ["Action"],
            "rating": 9.0,
            "ticket_price": "$16.00"
        }
    }

    match = movie_db.get(movie_title.lower().strip())
    if not match:
        return json.dumps({"error": f"No active showtimes found for '{movie_title}' in {city}."})

    return json.dumps({"movie": movie_title, "city": city, "date": date, "details": match})


@tool
def fetch_movie_ticket_status(booking_id: str) -> str:
    """
    Retrieves booking status, auditorium numbers, and reserved seating for an existing ticket purchase.
    Use this when a user provides a ticket ID, PNR, or order number.
    """
    print(f"[Tool Log] Database lookup for reservation: {booking_id}")
    # In production, query your SQL/NoSQL transactional database
    mock_orders = {
        "CONF881": {
            "movie": "Inception",
            "theater": "Chicago Downtown AMC",
            "seats": "Row G - Seats 12, 13",
            "time": "2:15 PM",
            "status": "Active / Paid"
        }
    }
    return json.dumps(mock_orders.get(booking_id.upper().strip(), {"error": "Reservation not found."}))
