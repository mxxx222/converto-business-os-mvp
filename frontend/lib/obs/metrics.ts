import client from 'prom-client';

type MetricBundle = {
  register: client.Registry;
  HTTP_REQUESTS: client.Histogram<'method' | 'route' | 'status'>;
  OCR_DURATION: client.Histogram<'provider' | 'doc_type' | 'status'>;
  WS_PUBLISH_LATENCY: client.Histogram<string>;
  WS_BACKPRESSURE_GAUGE: client.Gauge<string>;
};

declare global {
  // eslint-disable-next-line no-var
  var __docflowMetrics: MetricBundle | undefined;
}

if (!global.__docflowMetrics) {
  const register = new client.Registry();

  client.collectDefaultMetrics({ register, prefix: 'docflow_' });

  const HTTP_REQUESTS = new client.Histogram({
    name: 'http_request_duration_seconds',
    help: 'HTTP request duration',
    labelNames: ['method', 'route', 'status'],
    buckets: [0.05, 0.1, 0.25, 0.5, 1, 2, 5]
  });

  const OCR_DURATION = new client.Histogram({
    name: 'ocr_duration_seconds',
    help: 'OCR processing duration',
    labelNames: ['provider', 'doc_type', 'status'],
    buckets: [0.2, 0.5, 1, 2, 3, 5, 10]
  });

  const WS_PUBLISH_LATENCY = new client.Histogram({
    name: 'ws_publish_latency_ms',
    help: 'WebSocket publish latency in ms',
    buckets: [1, 5, 10, 20, 50, 100, 250, 500]
  });

  const WS_BACKPRESSURE_GAUGE = new client.Gauge({
    name: 'ws_backpressure_queue_size',
    help: 'Current WS backpressure queue size'
  });

  register.registerMetric(HTTP_REQUESTS);
  register.registerMetric(OCR_DURATION);
  register.registerMetric(WS_PUBLISH_LATENCY);
  register.registerMetric(WS_BACKPRESSURE_GAUGE);

  global.__docflowMetrics = {
    register,
    HTTP_REQUESTS,
    OCR_DURATION,
    WS_PUBLISH_LATENCY,
    WS_BACKPRESSURE_GAUGE
  };
}

const metrics = global.__docflowMetrics!;

export const { register, HTTP_REQUESTS, OCR_DURATION, WS_PUBLISH_LATENCY, WS_BACKPRESSURE_GAUGE } = metrics;
