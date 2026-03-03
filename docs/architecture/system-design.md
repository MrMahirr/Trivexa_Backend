# System Design Document

**Trivexa Agency Management System** is a comprehensive solution designed to manage the entire lifecycle of a digital agency, from client acquisition to project delivery and financial accounting.

## 1. System Context (C4 Level 1)

```mermaid
graph TD
    User[Agency Staff / Admin] -->|HTTPS| WebApp[React Web App]
    Client[Agency Client] -->|HTTPS| Portal[Client Portal]

    WebApp -->|JSON API / REST| Backend[Trivexa Backend API]
    Portal -->|JSON API / REST| Backend
    WebApp -->|WebSocket (WSS)| Backend

    Backend -->|SQL| DB[(PostgreSQL Primary)]
    Backend -->|Read/Write| Cache[(Redis Cache)]

    Backend -->|SMTP| Email[Email Service]
    Backend -->|HTTPS| S3[Object Storage]
```

## 2. Containers & Technologies

### 2.1 Backend API (NestJS)

- **Role**: Core business logic, data validation, and orchestration.
- **Framework**: NestJS (Node.js).
- **Architecture**: Modular Monolith with Clean Architecture principles.
- **Communication**: REST APIs and Real-Time WebSocket (Presence/Notifications).
- **Concurrency**: Asynchronous I/O (Event Loop).

### 2.2 Database (PostgreSQL 16)

- **Role**: Impactful, persistent data storage.
- **Schema**: Relational (3NF).
- **Features Used**: JSONB for flexible attributes, CTEs for complex reports, Window Functions for specific analytics.

### 2.3 Cache & Queue (Redis 7)

- **Role**: High-speed ephemeral storage.
- **Usage**:
  - **Caching**: Session data, expensive query results.
  - **Real-Time State**: WebSocket Active Users (Presence) tracking and multi-tab state management.
  - **Throttling**: Rate limiting counters.
  - **Queues**: Background job management (e.g., sending emails, generating PDFs).

### 2.4 Object Storage (S3 Compatible)

- **Role**: Storing unstructured files.
- **Usage**: User avatars, project attachments, contract PDFs.

## 3. Key Design Decisions

### 3.1 Single Database vs. Polyglot

We chose a **single relational database** (PostgreSQL) to maintain data consistency (ACID) across complex relationships (e.g., Project -> Task -> Invoice -> Ledger). No NoSQL DB is used as the schema is highly structured.

### 3.2 Monolith vs. Microservices

We chose a **Modular Monolith** to maximize development velocity and simplify deployment. The strict module boundaries allow for future extraction if scaling requires it.

## 4. Scalability Strategy

- **Horizontal Scaling**: The Backend is stateless. We can run `N` instances behind a Load Balancer.
- **Database Scaling**: Read Replicas can be added to offload reporting queries.
- **Caching**: Aggressive caching of non-volatile data (e.g., Permissions, Settings) reduces DB load.
