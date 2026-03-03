# Microservices Design Strategy

> **Current State**: Modular Monolith

Trivexa Backend is currently architected as a **Modular Monolith**. This provides the development speed of a monolith while maintaining the strict boundaries required for a future microservices migration.

## 1. Why Modular Monolith?

Given the team size and project stage, a distributed system (Microservices) would introduce unnecessary complexity (Deployment, Distributed Transactions, Event Consistency).

Instead, we enforce **strict module boundaries** within a single codebase.

### 1.1 Architecture Design
- **Single Deployment Unit**: One Docker container creates the simpler DevOps pipeline.
- **In-Memory Communication**: Modules communicate via method calls (Services), not network calls (HTTP/gRPC), ensuring <1ms latency.
- **Shared Database**: Currently using a single PostgreSQL instance, but schemas are logically separated where possible.

## 2. Module Boundaries

The system is split into distinct domains. Each folder in `src/modules` represents a potential future microservice.

| Module | Responsibility | Future Service Candidate? |
|:---|:---|:---|
| `Auth` | Identity & Access Management | **Yes** (Identity Service) |
| `Users` | User Profiles & RBAC | No (Likely bundled with Auth or Core) |
| `Projects` | Project & Task Management | **Yes** (Project Service) |
| `Accounting` | Invoices, Payments, Ledger | **Yes** (Finance Service) |
| `Notifications` | Email/Hook Delivery | **Yes** (Notification Service) |

## 3. Communication Patterns

### 3.1 Synchronous (Current)
Modules import each other's **Public Services** (Facades).
*Example:* `InvoicesModule` imports `ProjectsPublicService` to validate project existence.

### 3.2 Asynchronous (Future Preparation)
We use an **Event Bus** (`src/shared/events`) to decouple side effects.
*Example:* When an `Invoice` is paid, an event `invoice.paid` is published. The `NotificationsModule` listens to this event to send an email.

**Migration Path:**
When moving to microservices, this in-memory Event Bus will be replaced with **RabbitMQ** or **Redis Pub/Sub** without changing the business logic.

## 4. Migration Strategy (Strangler Fig Pattern)

If usage scales to the point where Microservices are necessary, we will follow this plan:

1.  **Identify Bottleneck**: E.g., The `Notification` module is consuming too much CPU generating PDFs.
2.  **Extract Module**: Move `src/modules/notifications` code to a new NestJS application.
3.  **Replace Communication**:
    - Replace `NotificationPublicService` calls with HTTP/gRPC calls to the new service.
    - Replace Event Bus listeners with a Message Queue consumer.
4.  **Isolate Database**: Move Notification tables to a separate database.
5.  **Deploy**: Deploy the new service independently.
