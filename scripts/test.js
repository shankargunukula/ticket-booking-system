import http from 'k6/http';
import { sleep, check } from 'k6';

export const options = {
  stages: [
    { duration: '30s', target: 20 },
    { duration: '1m', target: 20 },
    { duration: '30s', target: 0 },
  ],
};

export default function () {
/*
  const url = 'http://api-gateway:8080/api/v1/bookings';

  const payload = JSON.stringify({
    userId: "customer_john_doe",
    eventId: "concert_rock_2026",
    seatId: "Row-A-Seat-012"
  });

  const params = {
    headers: {
      'Content-Type': 'application/json',
    },
  };

  const res = http.post(url, payload, params);

  check(res, {
    'status is 200 or 201': (r) => r.status === 200 || r.status === 201,
  });

  sleep(1); */
}
