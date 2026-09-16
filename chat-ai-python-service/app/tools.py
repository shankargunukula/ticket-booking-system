import json
from langchain_core.tools import tool
import urllib.request
import urllib.parse


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
    print(f"[Tool Log] Querying production API for {movie_title} in {city} on {date}...")

    # Define base URL destination
    base_url = "http://localhost:8000/api/v1/movies/search"

    # Encode values cleanly to safely manage spaces and symbols
    params = {
        "title": movie_title.strip(),
        "city": city.strip(),
        "date": date.strip()
    }
    url_parts = urllib.parse.urlencode(params)
    request_url = f"{base_url}?{url_parts}"

    try:
        req = urllib.request.Request(
            url=request_url,
            headers={"User-Agent": "chat-ai-python-service/1.0", "Accept": "application/json"}
        )

        with urllib.request.urlopen(req, timeout=5) as response:
            if response.status == 200:
                raw_data = response.read().decode("utf-8")
                api_response = json.loads(raw_data)

                # Check if the API itself returned an interior data error object
                if isinstance(api_response, dict) and "error" in api_response:
                    return json.dumps({"error": api_response["error"]})

                return json.dumps({
                    "movie": movie_title,
                    "city": city,
                    "date": date,
                    "details": {
                        "showtimes": api_response.get("showtimes"),
                        "genres": [api_response.get("genre")], # Converts single string to expected list array
                        "rating": api_response.get("rating"),
                        "ticket_price": f"${api_response.get('ticketPrice')}" # Maps camelCase to snake_case string with currency symbol
                    }
                })
            else:
                return json.dumps({"error": f"Service returned abnormal status: {response.status}"})

    except urllib.error.HTTPError as e:
        # Handles explicit non-200 responses (such as 404, 500, etc.) safely
        try:
            error_body = json.loads(e.read().decode("utf-8"))
            # Extracts detail field if using a standard FastAPI validation/NotFound layout
            msg = error_body.get("detail", f"No showtimes matching your query found ({e.code}).")
            return json.dumps({"error": msg})
        except Exception:
            return json.dumps({"error": f"Movie registry returned error code {e.code}."})

    except urllib.error.URLError as e:
        # Catch connection failures, bad DNS lookups, or local port connection dropouts
        return json.dumps({"error": "Movie schedule database is temporarily unreachable. Please try again later."})



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
