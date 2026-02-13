# CI/CD Pipeline Strategy

Trivexa uses **GitHub Actions** for Continuous Integration and Continuous Deployment.

## 1. Workflows

### 1.1 Pull Request (`pr-check.yml`)
run on `pull_request` to `main` or `develop`.

- **Lint**: `npm run lint` (ESLint) to ensure code quality.
- **Unit Tests**: `npm run test` (Jest) to catch regressions.
- **Build Check**: `npm run build` to ensure no transpilation errors.

### 1.2 Deployment (`deploy.yml`)
run on `push` to `main` (Production) or `develop` (Staging).

1.  **Test**: Runs full test suite (including E2E if configured).
2.  **Containerize**:
    - Build Docker Image: `trivexa-backend:latest`
    - Tag with Commit SHA: `trivexa-backend:sha-123456`
3.  **Push**: Push image to **GitHub Container Registry (GHCR)** or AWS ECR.
4.  **Deploy**:
    - Connect via SSH to the Target Server (Staging/Prod).
    - Pull new image.
    - Restart containers via `docker-compose up -d`.

## 2. Secrets Management

Sensitive credentials are stored in **GitHub Repository Secrets**:

| Secret Name | Description |
|:---|:---|
| `DOCKER_REGISTRY_URL` | URL of the container registry |
| `DOCKER_USERNAME` | Registry username |
| `DOCKER_PASSWORD` | Registry PAT or Password |
| `SSH_HOST` | IP address of deployment server |
| `SSH_KEY` | Private SSH Key for access |

## 3. Environment Promotion

We follow a strict promotion strategy:

1.  **Develop Branch**: Deploys automatically to **Staging** environment.
    - Used for internal QA and UAT.
2.  **Main Branch**: Deploys automatically to **Production**.
    - Triggered only after a PR from `develop` is reviewed and merged.
