import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  vus: 10,
  duration: '30s',
  thresholds: {
    http_req_duration: ['p(95)<800'],
    http_req_failed: ['rate<0.01'],
  },
};

const BASE = __ENV.TARGET_BASE || 'http://localhost:8000';

export default function () {
  const res1 = http.get(`${BASE}/health`);
  check(res1, { 'gateway healthy': (r) => r.status === 200 });

  const res2 = http.get(`${BASE}/services/health`);
  check(res2, { 'services health listed': (r) => r.status === 200 });

  sleep(1);
}

