# Access Control Strategy

Trivexa uses a **Hybrid RBAC/ABAC** model to ensure users can only access data they are authorized to see.

## 1. Authentication vs Authorization

- **Authentication (AuthN)**: "Who are you?" (Handled via JWT)
- **Authorization (AuthZ)**: "What can you do?" (Handled via Guards/Casl)

## 2. Role-Based Access Control (RBAC)

We assign high-level **Roles** to users.

| Role | Description | Scope |
|:---|:---|:---|
| `ADMIN` | Full System Access | Global |
| `MANAGER` | Can manage Projects/Team | Department/Project |
| `MEMBER` | Can execute Tasks | Assigned Tasks |
| `CLIENT` | Read-only access to their data | Own Company |

## 3. Attribute-Based Access Control (ABAC)

Sometimes Role is not enough. We need to check **Attributes** (Ownership).
*Example: A Project Manager can only edit projects they are assigned to.*

### Implementation
We check ownership in the Service layer or using Casl ability factory.

```typescript
// ProjectService.update()
if (user.role !== 'ADMIN' && project.managerId !== user.id) {
  throw new ForbiddenException('You do not own this project');
}
```

## 4. Permission Granularity

Permissions take the form of `RESOURCE:ACTION`.

- `users:create`
- `projects:delete`
- `invoices:read`

These are mapped to Roles in the database (`role_permissions` table).

## 5. Row-Level Security (Data Isolation)

To prevent data leaks between tenants (Clients):
- Every query must include a `WHERE client_id = ?` clause if the user is a Client.
- We use a global **TypeORM Scope** or **Repository Wrapper** to enforce this automatically.
