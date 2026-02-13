# Monitoring & Observability

To ensure Trivexa Backend runs reliably in production, we implement a 4-pillar observability strategy.

## 1. Health Checks

We use **@nestjs/terminus** to expose health endpoints. Kubernetes and Load Balancers use these to determine if an instance is ready to receive traffic.

### Endpoints
- `GET /health`: Checks status of:
    - **Database**: Can we run `SELECT 1`?
    - **Redis**: Command `PING` response.
    - **Disk Space**: Is storage usage < 90%?
    - **Memory**: Is heap usage within limits?

### Usage
- **Liveness Probe**: Restarts pod if app completely hangs.
- **Readiness Probe**: Removes pod from Load Balancer until DB connection is established.

## 2. Structured Logging

We use **Pino** (via `nestjs-pino`) for high-performance, JSON-structured logging.

### Format
```json
{
  "level": "info",
  "time": 1678886400000,
  "pid": 123,
  "hostname": "trivexa-api-pod-1",
  "req": {
    "id": "req-1",
    "method": "POST",
    "url": "/api/v1/auth/login",
    "remoteAddress": "192.168.1.1"
  },
  "msg": "User login successful"
}
```

### Log Levels
- `ERROR`: Exceptions, 500 responses.
- `WARN`: Deprecated usage, near-limit quotas.
- `INFO`: Startup messages, critical business actions.
- `DEBUG`: Detailed flow (Disabled in Prod).

## 3. Metrics (Prometheus)

We expose metrics at `/metrics` for **Prometheus** scraping using `@willsoto/nestjs-prometheus`.

### Key Metrics
- `http_request_duration_seconds`: Latency buckets.
- `http_requests_total`: Throughput and Error Rates (4xx, 5xx).
- `nodejs_eventloop_lag_seconds`: Event loop health.
- `process_cpu_user_seconds_total`: CPU usage.

**Dashboard**: Grafana visualizations consuming Prometheus data.

## 4. Error Tracking (Sentry)

We use **Sentry** to capture unhandled exceptions and performance traces.

- **Scope**: Captures User ID, URL, and Headers context.
- **Alerts**: Slack notifications for new regression issues.
