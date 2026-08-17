import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  scenarios: {
    million_requests_job: {
      executor: 'shared-iterations',
      vus: 200,                  // Adjust based on your CPU/network capacity
      iterations: 1000000,       // Exactly 1 million requests
      maxDuration: '1h',         // Safety timeout window
    },
  },
};

export default function () {
  // Replace with your actual target URL
  const res = http.get('https://test.k6.io');

  check(res, {
    'status is 200': (r) => r.status === 200,
  });

  // Optional: Add pacing if you want to avoid overwhelming your machine/target instantly
  // sleep(0.1);
}
