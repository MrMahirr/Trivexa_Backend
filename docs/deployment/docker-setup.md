# Docker Development Setup

This guide explains how to spin up the Trivexa Backend infrastructure using Docker.

## 1. Prerequisites

- **Docker Desktop** (or Docker Engine + Compose Plugin) installed.
- **Node.js 18+** installed (since the app currently runs on the host).

## 2. Infrastructure Services

We use `docker-compose.yml` to run the required backing services:
- **PostgreSQL**: Database (Port `2678` -> `5432`)
- **Redis**: Cache & Queue (Port `6379` -> `6379`)

### 2.1 Starting Services

```bash
# Start all infrastructure in the background
docker-compose up -d

# Check running containers
docker-compose ps
```

### 2.2 Stopping Services

```bash
# Stop containers but keep data
docker-compose stop

# Stop and remove containers (Data persists in volumes)
docker-compose down
```

### 2.3 Volume Management

Data is persisted in Docker Volumes:
- `trivexa_backend_postgres_data`
- `trivexa_backend_redis_data`

To **reset** the database completely (Wipe all data):
```bash
docker-compose down -v
```

## 3. Database Initialization

The PostgreSQL container runs scripts in `./docker/postgres/init` on the *first* startup.
This creates the schema tables (Users, Projects, Expenses, etc.).

If you modify SQL scripts and need to re-apply them:
1.  Stop containers (`docker-compose down -v`)
2.  Start again (`docker-compose up -d`)

## 4. Troubleshooting

**Port Conflicts**:
If port `2678` or `6379` is already in use, modify `docker-compose.yml` or stop the conflicting service.

**Connection Refused**:
Ensure the container status is `Up (healthy)`. PostgreSQL takes a few seconds to accept connections after starting.
