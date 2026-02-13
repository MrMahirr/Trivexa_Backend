# Deployment Architecture

This document describes the current and planned deployment strategies for Trivexa Backend.

## 1. Current Development Environment (Local)

The project currently runs in a **Hybrid Mode**:
- **Database**: Runs in Docker.
- **Application**: Runs on the Host Machine (Node.js).

### 1.1 Docker Compose (`docker-compose.yml`)
Currently, `docker-compose` is used **only** for infrastructure services.

| Service | Image | Internal Port | Host Port | Volume |
|:---|:---|:---|:---|:---|
| `postgres` | `postgres:18-alpine` | 5432 | 2678 | `postgres_data` |
| `redis` | *(Planned)* | 6379 | 6379 | `redis_data` |

**Setup Command:**
```bash
# Start Database
docker-compose up -d postgres

# Start Application (Host)
npm run start:dev
```

### 1.2 Application Runtime
- **Runtime**: Node.js (via `npm`)
- **Framework**: NestJS
- **Process Manager**: Common `nodemon` (via Nest CLI)

---

## 2. Planned Production Architecture (Target)

> **Note:** These configurations are planned and not yet fully implemented in the codebase.

### 2.1 Containerization
A `Dockerfile` will be created to containerize the NestJS application.

```dockerfile
# (Draft)
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:18-alpine
WORKDIR /app
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
CMD ["node", "dist/main"]
```

### 2.2 Production Services
In production, we aim to use managed services rather than containers for persistence.

- **App**: Docker Container (AWS ECS / Kubernetes)
- **Database**: Managed PostgreSQL (AWS RDS)
- **Cache**: Managed Redis (AWS ElastiCache)

### 2.3 CI/CD Strategy
- **Build**: Github Actions to build Docker Image.
- **Registry**: AWS ECR or Docker Hub.
- **Deploy**: Rolling update to container orchestration service.
