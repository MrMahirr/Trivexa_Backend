# Scaling Guide

As Trivexa adoption grows, the system is designed to scale to support increased load.

## 1. Application Layer (Stateless)

The NestJS backend is **stateless**, meaning it does not store user sessions in local memory.
This allows us to scale **Horizontally**.

### Strategy
- **Horizontal Pod Autoscaling (HPA)**:
    - Metric: CPU Utilization > 70%.
    - Action: Add more Pods/Containers.
    - Limit: Max 10 Replicas (start small, increase as needed).

## 2. Database Layer (Stateful)

The database is usually the bottleneck in high-scale systems.

### 2.1 Vertical Scaling
- **Initial Step**: Upgrade the instance size (e.g., `db.t3.medium` -> `db.m5.large`).
- **Pros**: Simple, no code changes.
- **Cons**: Has a hard limit (max server size), requires downtime to resize.

### 2.2 Read Replicas
- **Action**: Create read-only copies of the database in different Availability Zones.
- **Routing**: Configure TypeORM/Pg to send `SELECT` queries to Replicas and `INSERT/UPDATE` to Primary.
- **Impact**: Offloads heavy reporting/dashboard queries.

### 2.3 Sharding (Future)
- *Note:* Sharding adds significant complexity. We will only consider this if we exceed 5TB of data or write throughput limits of a single large instance.

## 3. Caching Layer (Redis)

Aggressive caching is the most cost-effective way to scale.

- **Session Store**: User sessions are stored in Redis.
- **Query Cache**: Complex reports (e.g., Monthly Financials) are cached for 1-24 hours.
- **CDN**: Static assets (S3 files, frontend build) are cached at the edge via CloudFront.

## 4. Background Jobs

Long-running tasks (e.g., "Send 10,000 Emails", "Generate PDF Report") are offloaded to **Queues** (Redis/BullMQ).

- **Benefit**: Ensures the API remains responsive (fast <100ms response).
- **Scaling**: We can scale `Worker` pods independently of `API` pods.
