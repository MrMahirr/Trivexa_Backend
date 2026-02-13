# Coding Standards & Best Practices

To maintain a high-quality codebase, all contributors must adhere to these standards.
This project follows **Clean Architecture** and strict **NestJS** idioms.

## 1. General Principles

- **Separation of Concerns**: Logic must sit in the correct layer (UseCase vs Controller vs Repository).
- **Don't Repeat Yourself (DRY)**: Extract common logic into `src/shared` or `src/common`.
- **Keep It Simple (KISS)**: Avoid over-engineering. Pure SQL is preferred over complex ORM abstractions.
- **Fail Fast**: Validate inputs at the edge (DTOs) and throw exceptions early.

## 2. TypeScript Guidelines

- **Strict Mode**: `strict: true` is enabled in `tsconfig.json`. No `any` allowed.
- **Explicit Types**: Always define return types for functions.
    ```typescript
    // Bad
    function getUser(id) { ... }
    
    // Good
    function getUser(id: string): Promise<UserEntity> { ... }
    ```
- **Interfaces vs Types**: Use `interface` for public contracts and `type` for unions/intersections.

## 3. Naming Conventions

| Item | Convention | Example |
|:---|:---|:---|
| **Files** | `kebab-case` | `user-profile.controller.ts` |
| **Classes** | `PascalCase` | `UserProfileController` |
| **Interfaces** | `PascalCase` | `IUserRepository` (Prefix with I only for contracts) |
| **Variables** | `camelCase` | `userData`, `isValid` |
| **Constants** | `UPPER_SNAKE_CASE` | `MAX_LOGIN_ATTEMPTS` |
| **Enums** | `PascalCase` | `UserRole.Admin` |

## 4. Architectural Rules

### 4.1 Controllers (`*.controller.ts`)
- **DO**: Validate input (DTOs), handle HTTP codes.
- **DON'T**: Contain business logic or SQL queries.

### 4.2 Use Cases (`*.use-case.ts`)
- **DO**: Orchestrate business logic, call Repositories.
- **DON'T**: Depend on HTTP-specific objects (`req`, `res`).

### 4.3 Repositories (`*.repository.ts`)
- **DO**: Execute SQL queries, map DB rows to Domain Entities.
- **DON'T**: Contain business rules (validation).

## 5. Error Handling

- Use **Custom Exceptions** extending `HttpException`.
- Never throw raw errors if possible; wrap them.
    ```typescript
    throw new NotFoundException('User not found');
    ```

## 6. Git & Commit Messages

- **Conventional Commits**:
    - `feat: add login endpoint`
    - `fix: resolve null pointer in user service`
    - `docs: update api architecture`
    - `refactor: simplify auth guard`
