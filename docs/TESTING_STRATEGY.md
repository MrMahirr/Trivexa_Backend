# 🏗️ Trivexa Backend - Senior Architectural Audit & Testing Strategy

**Date:** 2026-02-19
**Auditor:** Senior Staff Engineer (AI)
**Project Type:** Enterprise Backend (NestJS + Raw SQL + Redis)
**Architecture Style:** Modular Monolith with Clean Architecture principles

---

## 1️⃣ Project Architecture Analysis

### Architectural Style Detected
The project strictly follows a **Modular Monolith** architecture with **Clean Architecture** principles inside each module.
- **Layers:**
  - **API Layer (Controllers/DTOs):** Handles HTTP requests, validation, and serialization.
  - **Application Layer (Use Cases):** Contains pure business logic, orchestration, and transaction boundaries.
  - **Domain Layer (Entities/Rules):** Logic residing within entities and domain rules files (Rich Domain Model attempt).
  - **Infrastructure Layer (Repositories/SQL):** DB access, external services, raw SQL queries.

### Module Boundaries Evaluation
- **Strengths:** Modules (`auth`, `users`, `projects`, `finance`) are well-separated by domain. Use cases prevent monolithic service classes ("God Classes").
- **Weaknesses:** Direct dependency on `DatabasePool` in repositories is acceptable for raw SQL but requires careful mocking. Cross-module communication (e.g., Finance checking User existence) needs to be strictly managed via public APIs or shared kernels to avoid cyclic dependencies.

### Dependency Direction Analysis
- **Correct:** Controllers depend on Use Cases. Use Cases depend on Repository Interfaces (implicit or explicit).
- **Risk:** If Use Cases import `Repository` classes directly instead of interfaces, it violates Dependency Inversion (DIP), making testing harder.
  - *Recommendation:* Ensure `UseCases` interact with `Interfaces`, not concrete `Repositories` if strict DIP is desired. ideally, NestJS DI handles this, but explicit interfaces are better for mocking.

### Coupling & Cohesion
- **High Cohesion:** `finance` module correctly groups `invoices`, `payments`, `expenses`.
- **Low Coupling:** Verification needed on how modules interact. If `ProjectsModule` imports `UsersRepository`, that's high coupling. Ideally, `ProjectsModule` should use `UsersService` or a `UserFacade`.

### Key Risk Areas
1.  **Raw SQL MaIntenance:** While performant, `node-pg-migrate` + raw SQL strings in `.ts` files can become brittle. Validation of SQL queries happens only at runtime.
2.  **Type Safety in SQL:** Mapping `rows` to `Entities` manually is error-prone.
3.  **Transaction Management:** Manually passing `client` or `transaction` objects through layers can be messy.

---

## 2️⃣ Testability Assessment

### Easy to Test 🟢
- **Domain Entities & Rules:** Pure TypeScript classes. No dependencies. easy to unit test.
- **DTOs:** Pure data carriers. Validation logic can be tested via `class-validator`.
- **Utility Functions:** (Crypto, Date helpers) - Pure functions.

### Hard to Test 🔴 (and why)
- **Repositories:** They depend on `DatabasePool` and `pg`. Requires either:
  - Complex mocking of `pg.Pool` and `pg.Client`.
  - OR Integration tests with a real DB (Docker/Testcontainers).
- **Use Cases using Transactions:** If a Use Case manages a transaction directly (`pool.connect()`, `BEGIN`, `COMMIT`), mocking becomes very verbose.

### Refactoring Needed for Testability
- **Abstract Transaction Logic:** Don't let Use Cases call `pool.connect()`. Use a `TransactionManager` or `UnitOfWork` abstraction.
- **Interface Injection:** Ensure Repositories implement an interface. Use `@Inject('IUserRepository')` if possible, or just standard NestJS DI is fine as long as we can override the provider.

---

## 3️⃣ Unit Testing Strategy (Senior-Level Roadmap)

### Phase 1 – Foundation Setup 🛠️
- **Framework:** **Jest** (Standard for NestJS). *Vitest* is faster but Jest has better NestJS integration out-of-the-box.
- **Structure:** `src/modules/{module}/tests/` or alongside files `*.spec.ts`. *Recommendation:* Alongside files for Unit, `test/` folder for E2E.
- **Naming:**
  - `*.spec.ts`: Unit Tests (Isolated).
  - `*.test.ts` or `*.e2e-spec.ts`: Integration/E2E (DB required).
- **CI Strategy:**
  - **Pre-commit:** Run Unit Tests only (lint-staged).
  - **PR Merge:** Run Unit + Integration Tests (GitHub Actions).

### Phase 2 – Core Domain Testing (The "Why" Layer) 🧠
*Start here. It’s the cheapest and most valuable.*
- **Entities:** Test `User.create()`, logic inside getters/setters.
- **Domain Rules:** Test `TaskRules.canAssign()`, `ProjectRules.canChangeStatus()`.
- **Value Objects:** If any exist (e.g., `Email`, `Money`).

### Phase 3 – Application Layer Testing (The "How" Layer) ⚙️
*Most critical for business logic.*
- **Use Cases:** Isolate Use Cases from DB.
  - **Mock:** All Repositories, External Services (Email, Payment).
  - **Test:** Behavior, Flow control, Error handling.
  - **Do NOT Test:** SQL queries here.

### Phase 4 – Infrastructure Layer Testing (The "Repo" Layer) 🗄️
*Don't mock pg driver. It's useless. Use real DB.*
- **Strategy:** Integration Tests using **Testcontainers** (Docker).
- **Why?** Mocking `SELECT * FROM ...` proves nothing. You need to verify the SQL syntax and constraints.
- **Flow:**
  1. Spin up Postgres container.
  2. Run Migrations.
  3. Seed Data.
  4. Execute Repository method.
  5. Assert DB state.
  6. Teardown.

### Phase 5 – Controller/API Testing 🌐
- **Unit:** Mock Use Cases. Verify DTO validation request mapping and HTTP status codes.
- **E2E:** `supertest` against the running NestJS app (connected to Testcontainers DB). Verify full request lifecycle.

---

## 4️⃣ Mocking & Dependency Strategy

### How to Mock Repositories
Use `jest.createMockFromModule` or manual mock objects.

```typescript
const mockUsersRepo = {
  findById: jest.fn(),
  create: jest.fn(),
};
```

### How to Mock Redis
Do **NOT** use a real Redis for Unit tests. Use `ioredis-mock` or a manual mock for `RedisService`.
For Integration tests, use a Redis Testcontainer.

### How to Prevent Over-Mocking
- **Rule:** Only mock **external** dependencies (DB, API, IO).
- **Don't Mock:**
  - Entities (Just instantiate them).
  - DTOs (Just instantiate them).
  - Helper functions (Unless they involve IO/Time).

---

## 5️⃣ Folder Structure Recommendation

```text
src/
├── modules/
│   └── users/
│       ├── application/
│       │   └── usecases/
│       │       ├── create-user.usecase.ts
│       │       └── create-user.usecase.spec.ts  <-- UNIT
│       ├── domain/
│       │   ├── user.entity.ts
│       │   └── user.entity.spec.ts              <-- UNIT
│       ├── infrastructure/
│       │   ├── users.repository.ts
│       │   └── users.repository.integration.ts  <-- INTEGRATION (Real DB)
test/
├── jest-e2e.json
├── app.e2e-spec.ts                              <-- E2E (Full System)
└── test-utils/                                  <-- Factories, Seeders
```

---

## 6️⃣ Code Examples

### A. Well-Written Unit Test (Use Case)

```typescript
describe('CreateUserUseCase', () => {
  let useCase: CreateUserUseCase;
  let mockRepo: Partial<UsersRepository>;

  beforeEach(async () => {
    mockRepo = {
      findByEmail: jest.fn().mockResolvedValue(null),
      create: jest.fn().mockResolvedValue({ id: '1', email: 'test@trivexa.com' }),
    };

    const module = await Test.createTestingModule({
      providers: [
        CreateUserUseCase,
        { provide: UsersRepository, useValue: mockRepo },
      ],
    }).compile();

    useCase = module.get<CreateUserUseCase>(CreateUserUseCase);
  });

  it('should create a user if email is unique', async () => {
    const dto = { email: 'test@trivexa.com', password: 'Password1!' };
    const result = await useCase.execute(dto);

    expect(mockRepo.findByEmail).toHaveBeenCalledWith(dto.email);
    expect(mockRepo.create).toHaveBeenCalled();
    expect(result.id).toBe('1');
  });

  it('should throw ConflictException if email exists', async () => {
    mockRepo.findByEmail = jest.fn().mockResolvedValue({ id: 'existing' });

    await expect(useCase.execute({ email: 'test@trivexa.com', ... }))
      .rejects.toThrow(ConflictException);
  });
});
```

### B. Mocking a Repository (Providers Array)

```typescript
{
  provide: ProjectsRepository,
  useFactory: () => ({
    findAll: jest.fn(() => Promise.resolve([])),
    findById: jest.fn((id) => Promise.resolve({ id })),
  }),
}
```

---

## 7️⃣ Coverage Strategy

- **Target:** 80% Overall.
- **Layers:**
  - **Domain / Use Cases:** 100% (Critical Logic).
  - **Utils:** 100% (Pure functions).
  - **Controllers:** 50-70% (Mainly checking HTTP codes).
  - **Infrastructure:** Ignore coverage metrics. Rely on Pass/Fail of integration tests.
- **What NOT to test:**
  - DTOs (unless custom validation logic exists).
  - Modules (pure configuration).
  - Bootstrap (`main.ts`).

---

## 8️⃣ Final Senior-Level Recommendations

1.  **Avoid "Testing Implementation Details":** Don't test *how* a method works (e.g., "it calls method X then Y"). Test *observables* (Return value, Exception thrown, Side effect like DB call).
2.  **Factories over Fixtures:** Use a library like `faker.js` within a Factory function to generate random test data. Static JSON fixtures become stale and rigid.
3.  **Testcontainers IS A MUST:** Do not mock your SQL queries. It's a waste of time. Verify they run against a real Postgres instance in CI.
4.  **Keep Tests Fast:** Unit tests must run in milliseconds. If they take seconds, you are testing too much (or including IO).
5.  **TDD for Complex Logic:** If writing a complex Domain Rule (e.g., Accounting double-entry validation), write the test *first*.

---
