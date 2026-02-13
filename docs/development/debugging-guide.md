# Debugging Guide

This guide helps you troubleshoot issues in the Trivexa Backend.

## 1. VS Code Debugging

To debug the NestJS application directly in VS Code:

1.  Create a `.vscode/launch.json` file in the root directory.
2.  Add the following configuration:

```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "type": "node",
      "request": "launch",
      "name": "Debug NestJS",
      "runtimeArgs": [
        "run-script",
        "start:debug"
      ],
      "autoAttachChildProcesses": true,
      "console": "integratedTerminal"
    }
  ]
}
```

3.  Set breakpoints in your code.
4.  Press `F5` or run "Debug NestJS" from the Run and Debug tab.

## 2. Inspecting Logs

We use **Pino** for structured logging.

- **Development**: Logs are pretty-printed for readability.
- **Production**: Logs are JSON formatted.

### Changing Log Level
You can adjust the log verbosity via `.env`:
```env
LOG_LEVEL=debug  # options: fatal, error, warn, info, debug, trace
```

## 3. Database Debugging

### 3.1 Inspecting Data
Use a GUI client to connect to the local PostgreSQL instance:
- **Host**: `localhost`
- **Port**: `2678` (Mapped from Docker 5432)
- **User**: `admin`
- **Password**: `admin123`
- **Database**: `trivexa_db`

**Recommended Tools**:
- [TablePlus](https://tableplus.com/)
- [pgAdmin](https://www.pgadmin.org/)
- [DBeaver](https://dbeaver.io/)

### 3.2 SQL Query Logs
To see every SQL query executed by the application, enable query logging in `src/config/database.config.ts` (or via env):
```env
DB_LOGGING=true
```

## 4. Common Issues

### "Port 3000 is already in use"
- Check if another instance of the app is running.
- Run `npx kill-port 3000`.

### "Connection Refused (Postgres)"
- Ensure Docker is running: `docker-compose up -d`.
- Check if the container is healthy: `docker ps`.
- Verify port mapping: `2678` locally, not `5432`.
