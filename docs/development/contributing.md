# Contributing to Trivexa Backend

Thank you for your interest in contributing to Trivexa!
Please follow this guide to set up your environment and submit high-quality contributions.

## 1. Getting Started

### 1.1 Prerequisites
- **Node.js**: v18 or later
- **Docker**: For running Database and Redis
- **Git**: For version control

### 1.2 Setup
1.  **Clone the repository**:
    ```bash
    git clone https://github.com/your-org/trivexa-backend.git
    cd trivexa-backend
    ```
2.  **Install dependencies**:
    ```bash
    npm install
    ```
3.  **Setup Environment**:
    ```bash
    cp .env.example .env
    # Update .env with your local settings if needed
    ```
4.  **Start Infrastructure**:
    ```bash
    docker-compose up -d
    ```
5.  **Run Development Server**:
    ```bash
    npm run start:dev
    ```

## 2. Development Workflow

We follow the **Gitflow** branching strategy.

- **`main`**: Production-ready code. DO NOT push directly.
- **`develop`**: Integration branch for next release.
- **Feature Branches**: `feature/my-feature` (create from `develop`).
- **Bugfix Branches**: `fix/bug-id` (create from `develop`).

### 2.1 Making Changes
1.  Create a new branch: `git checkout -b feature/add-user-login`
2.  Write code and **tests**.
3.  Ensure linting passes: `npm run lint`
4.  Ensure tests pass: `npm run test`

## 3. Pull Request (PR) Process

1.  Push your branch to GitHub.
2.  Open a Pull Request against **`develop`**.
3.  Fill out the PR Template (Description, Changes, Testing).
4.  Request review from at least one team member.
5.  Address feedback.
6.  Once approved, `Squash and Merge`.

## 4. Reporting Bugs

If you find a bug, please create a GitHub Issue with:
- **Steps to Reproduce**: Detailed instructions.
- **Expected Behavior**: What should happen?
- **Actual Behavior**: What happened instead?
- **Screenshots/Logs**: Evidence of the issue.
