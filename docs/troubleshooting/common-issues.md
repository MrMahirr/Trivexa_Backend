# Common Troubleshooting Issues

A glossary of common errors and their solutions.

## 1. Startup & Environment

### 1.1 `Error: seek() failed: EBADF: bad file descriptor`
- **Cause**: Node.js file watching issue on Windows/WSL.
- **Fix**: Update Node.js to latest LTS or restart VS Code.

### 1.2 `Error: listen EADDRINUSE: address already in use :::3000`
- **Cause**: Another instance of the backend is running.
- **Fix**:
    ```bash
    npx kill-port 3000
    ```

## 2. Database & Docker

### 2.1 `Connection refused at localhost:2678`
- **Cause**: Docker container is not running or port mapping is wrong.
- **Fix**:
    1. Check status: `docker ps`
    2. Restart: `docker-compose restart postgres`
    3. Verify `.env` matches `docker-compose.yml` ports.

### 2.2 `role "admin" does not exist`
- **Cause**: Database volume persists from an old setup.
- **Fix**:
    ```bash
    docker-compose down -v  # Deletes Volumes!
    docker-compose up -d    # Re-initializes DB
    ```

## 3. TypeScript & Build

### 3.1 `Cannot find module 'src/...'`
- **Cause**: `tsconfig.json` paths not resolved or `NODE_PATH` missing.
- **Fix**: Ensure you are running via `npm run start:dev` (which uses `nest start`).

### 3.2 `Prettier/ESLint` conflicts
- **Fix**: Run `npm run format` to auto-fix style issues.
