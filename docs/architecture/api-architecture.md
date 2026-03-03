# API Architecture & Request Lifecycle

Trivexa Backend follows a strict **Clean Architecture** combined with **NestJS** idioms.
This ensures separation of concerns, testability, and independence from external frameworks/drivers.

## 1. High-Level Request Flow

Every HTTP request passes through the following pipeline:

```mermaid
graph TD
    A[Client Request] --> B[Middleware]
    B --> C[Guards]
    C --> D[Interceptors (Pre)]
    D --> E[Pipes (Validation)]
    E --> F[Controller]
    F --> G[Use Case (Application)]
    G --> H[Domain Entity / Rules]
    G --> I[Repository (Infrastructure)]
    I --> J[Database (PostgreSQL)]
    I -- Data --> G
    G -- Result --> F
    F --> K[Interceptors (Post - Response Mapping)]
    K --> L[Exception Filters (If Error)]
    L --> M[Client Response]
```

### 1.1 WebSocket (Real-Time) Flow

In addition to REST, the system uses WebSocket via `socket.io` for real-time presence and notifications:

- Handled by **Gateways** (`@WebSocketGateway`).
- Guarded by **WsJwtAuthGuard** (`handshake.auth.token`).
- Operates under isolated namespaces (e.g., `/presence`).
- Emits real-time state broadcasts (`server.to(room).emit()`).

---

## 2. Components Description

### 2.1 Middleware (`src/common/middlewares`)

Runs before the request hits the router.

- **Logging**: Logs method, URL, IP.
- **Security**: Helmet, CORS.
- **Request Context**: Attaches a unique `x-request-id`.

### 2.2 Guards (`src/common/guards`)

Determines _can this request proceed?_

- **JwtAuthGuard**: Verifies Access Token.
- **RolesGuard**: Checks high-level roles (ADMIN, MANAGER).
- **PermissionsGuard**: Checks granular permissions (e.g., `PROJECT_CREATE`).

### 2.3 Pipes (`src/common/pipes`)

Transforms and validates input data.

- **ValidationPipe**: Uses `class-validator` to ensure DTOs are valid. Stips unknown properties.

### 2.4 Controllers (`src/modules/*/api`)

**Responsibility:** HTTP Handling only.

- Defines Routes (`@Post('login')`).
- Unpacks DTOs from Body/Query.
- Calls the appropriate **Use Case**.
- **NEVER** contains business logic.

### 2.5 Use Cases (`src/application/use-cases`)

**Responsibility:** Orchestration.

- Contains the "What" of the application.
- Fetches data via **Ports** (Repository Interfaces).
- Executes Domain Logic via **Entities**.
- Saves state changes.

### 2.6 Domain (`src/domain`)

**Responsibility:** Pure Business Logic.

- **Entities**: Core objects (User, Project) with methods (`contract.sign()`).
- **Rules**: Complex validation logic (`UserCannotBeDeletedIfHasActiveTasks`).
- **Framework Agnostic**: No NestJS, No TypeORM, No SQL here.

### 2.7 Infrastructure (`src/infrastructure`)

**Responsibility:** The "How".

- **Repositories**: Implements interfaces defined in Application layer. Executes SQL.
- **Services**: Redis, Email, S3 implementations.

---

## 3. Response Standard

All successful responses are intercepted and wrapped in a standard Envelope:

```json
{
  "success": true,
  "statusCode": 200,
  "timestamp": "2024-02-14T12:00:00Z",
  "path": "/api/v1/projects",
  "data": { ... }
}
```

### Exception Handling

All errors are caught by `GlobalExceptionFilter` and formatted:

```json
{
  "success": false,
  "statusCode": 400,
  "errorCode": "VALIDATION_ERROR",
  "message": "Start date cannot be after End date",
  "timestamp": "..."
}
```
