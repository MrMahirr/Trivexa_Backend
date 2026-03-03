# Testing Guide

Quality Assurance is paramount in Trivexa. We use **Jest** for all testing needs.

## 1. Testing Pyramid

### 1.1 Unit Tests (`.spec.ts`)
- **Scope**: Individual classes (Services, Pipes, Guards).
- **Location**: Co-located with the source file (e.g., `user.service.spec.ts` next to `user.service.ts`).
- **Mocking**: All dependencies must be mocked. We test logic in isolation.

### 1.2 Integration Tests
- **Scope**: Interactions between modules (e.g., Controller -> Service).
- **Location**: Inside `src` but may involve a partial NestJS context.

### 1.3 End-to-End (E2E) Tests (`.e2e-spec.ts`)
- **Scope**: Full request lifecycle (HTTP Request -> Guard -> Controller -> Database -> Response).
- **Location**: `test/` directory.
- **Database**: Uses a dedicated **Test Database** (reset before each run).

## 2. Running Tests

```bash
# Run Unit Tests
npm run test

# Run Unit Tests (Watch Mode)
npm run test:watch

# Run E2E Tests
npm run test:e2e

# Generate Coverage Report
npm run test:cov
```

## 3. Writing Tests (Examples)

### 3.1 Unit Test (Service)

```typescript
describe('UserService', () => {
  let service: UserService;
  let repo: MockType<UserRepository>;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        UserService,
        { provide: UserRepository, useFactory: repositoryMockFactory },
      ],
    }).compile();

    service = module.get(UserService);
  });

  it('should find a user', async () => {
    repo.findOne.mockReturnValue(userEntity);
    expect(await service.findOne('123')).toEqual(userEntity);
  });
});
```

### 3.2 E2E Test (Controller)

```typescript
it('/auth/login (POST)', () => {
  return request(app.getHttpServer())
    .post('/auth/login')
    .send({ email: 'test@trivexa.com', password: 'password' })
    .expect(201)
    .expect((res) => {
      expect(res.body.accessToken).toBeDefined();
    });
});
```
