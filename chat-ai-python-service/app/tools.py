import json
from langchain_core.tools import tool
import urllib.request
import urllib.parse


import urllib.request
import urllib.parse


import json
from langchain_core.tools import tool
import urllib.request
import urllib.parse
from typing import Optional

@tool
def search_movie_showtimes(
        movie_title: Optional[str] = None,
        city: Optional[str] = None,
        date: Optional[str] = None
) -> str:
    """
    Searches the theater registry for available showtimes and movie details.
    """
    base_url = "http://booking-service:8081/api/v1/movies/search"

    # 1. Cleanly filter out 'None' or empty string values entirely
    params = {}
    if movie_title and str(movie_title).strip().lower() != "none":
        params["title"] = movie_title.strip()
    if city and str(city).strip().lower() != "none":
        params["city"] = city.strip()
    if date and str(date).strip().lower() != "none":
        params["date"] = date.strip()

    if not params:
        return json.dumps({"error": "Please provide at least one valid parameter (title, city, or date)."})

    url_parts = urllib.parse.urlencode(params)
    request_url = f"{base_url}?{url_parts}"
    print(f"[DEBUG CRITICAL] Outbound REST URL is: >>>{request_url}<<<")

    try:
        req = urllib.request.Request(
            url=request_url,
            headers={"User-Agent": "chat-ai-python-service/1.0", "Accept": "application/json"}
        )

        with urllib.request.urlopen(req, timeout=5) as response:
            raw_data = response.read().decode("utf-8")
            return json.dumps({"search_criteria": params, "results": json.loads(raw_data)})

    except urllib.error.HTTPError as e:
        # CRITICAL: Read what the Java application actually threw (500 Internal Error, 400 Bad Request)
        try:
            error_msg = e.read().decode("utf-8")
            return json.dumps({"error": f"Java Backend Error ({e.code}): {error_msg}"})
        except Exception:
            return json.dumps({"error": f"Java backend responded with HTTP Status {e.code}"})

    except urllib.error.URLError as e:
        return json.dumps({"error": f"Network connectivity problem: {str(e.reason)}"})




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
