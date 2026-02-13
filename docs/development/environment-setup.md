# Environment Setup

Starting development on Trivexa Backend is straightforward.

## 1. Required Tools
Ensure you have the following installed:
- **Node.js**: v18.x or higher (LTS recommended)
- **Docker & Docker Compose**: For running the database and cache.
- **Git**: For version control.
- **VS Code**: Recommended editor (with Prettier and ESLint extensions).

## 2. Configuration (`.env`)
Copy the example file to create your local persistent configuration:
```bash
cp .env.example .env
```

### Standard Variables
These defaults work out-of-the-box with the provided `docker-compose.yml`.

```ini
# Application
NODE_ENV=development
PORT=3500
API_PREFIX=api/v1

# Database (PostgreSQL)
DB_HOST=localhost
DB_PORT=2678        # Mapped from 5432
DB_USER=admin
DB_PASSWORD=admin123
DB_NAME=trivexa_db
DB_LOGGING=true

# Cache (Redis)
REDIS_HOST=localhost
REDIS_PORT=6379

# Authentication
JWT_SECRET=replace_this_with_a_secure_random_string
JWT_EXPIRATION=15m
JWT_REFRESH_SECRET=replace_this_with_another_secure_string
JWT_REFRESH_EXPIRATION=7d
```

## 3. Running the Project

### 3.1 Start Infrastructure
Start PostgreSQL and Redis containers:
```bash
docker-compose up -d
```
*Note: The first time you run this, it will initialize the database with tables and seed data.*

### 3.2 Install Dependencies
```bash
npm install
```

### 3.3 Start Application
Run the backend in watch mode (hot-reload):
```bash
npm run start:dev
```

## 4. Verification
- **API Health**: Visit `http://localhost:3500/api/v1/health` (once implemented).
- **Database**: Connect via `psql -h localhost -p 2678 -U admin -d trivexa_db`.
