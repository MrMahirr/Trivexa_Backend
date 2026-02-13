# Trivexa Backend - Developer Setup Guide

Welcome to the Trivexa Backend team! This guide is your starting point to get the application running on your local machine.

## 0. Prerequisites

Ensure you have the following installed:
- [Node.js](https://nodejs.org/) (v18+)
- [Docker Desktop](https://www.docker.com/products/docker-desktop/)
- [Git](https://git-scm.com/)
- [VS Code](https://code.visualstudio.com/)

## 1. Clone & Configure

1.  **Clone the repository**:
    ```bash
    git clone https://github.com/your-org/trivexa-backend.git
    cd trivexa-backend
    ```

2.  **Install dependencies**:
    ```bash
    npm install
    ```

3.  **Environment Variables**:
    ```bash
    cp .env.example .env
    ```
    *No need to edit `.env` initially; defaults are set for Docker.*

## 2. Start Infrastructure

We use Docker Compose to run PostgreSQL and Redis.

```bash
docker-compose up -d
```
> **Tip**: This command automatically creates the database schema and seeds initial data (Admin user, Roles, etc.).

## 3. Start Application

Run the server in development mode (hot-reload):

```bash
npm run start:dev
```

The API will be available at: `http://localhost:3000/api/v1`

## 4. Verify Installation

1.  **Check Health**: Open `http://localhost:3000/api/v1/health` in your browser.
2.  **API Docs**: Open `http://localhost:3000/api` (Swagger UI).
3.  **Database**: Connect with credentials from `.env` (Port 2678).

## 5. Next Steps

- Read [Architecture Overview](../architecture/api-architecture.md)
- Check [Coding Standards](./coding-standards.md)
- Learn about [Git Workflow](./git-workflow.md)

## Troubleshooting

- **Check Logs**: `docker-compose logs -f`
- **Reset DB**: `docker-compose down -v && docker-compose up -d`
- **Lint Errors**: `npm run lint`
