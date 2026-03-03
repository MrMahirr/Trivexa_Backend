# Authorization System Documentation

Trivexa Backend implements a **3-Layered RBAC (Role-Based Access Control)** system.
Authorization checks are performed in the following order:
1. **Authentication Check**: Is the user logged in? (Valid JWT)
2. **Role Check**: Does the user have the required Role?
3. **Department Check**: Does the user belong to the required Department?
4. **Permission Check**: Does the user have the specific Permission?

## 1. Roles
System defines high-level access scope.

| Role | Access Level | Description |
|:---|:---|:---|
| `ADMIN` | **System-Wide** | Full access to all modules, settings, and users. Bypasses most checks. |
| `PROJECT_MANAGER` | **Project-Wide** | Can create projects, assign teams, and view all project-related financial data. |
| `DEPARTMENT_LEAD` | **Department-Wide** | Manages tasks and members within their specific department. |
| `TEAM_MEMBER` | **Task-Based** | Can view assigned projects/tasks and log time. Limited access to other data. |
| `CLIENT` | **Portal-Only** | Restricted access via Client Portal. Can only view own projects and invoices. |

## 2. Departments
Used to segregate tasks and workflows. A user applies their role *within* a department context.

- `DESIGN`
- `DEVELOPMENT`
- `MARKETING`
- `FINANCE`
- `HR`
- `OPERATIONS`

## 3. Permissions
Granular control for specific actions. Permissions are assigned to Roles (and sometimes directly to users).

**Naming Convention:** `RESOURCE:ACTION`

### Common Permissions
- `users:create`, `users:read`, `users:update`, `users:delete`
- `projects:create`, `projects:read`, `projects:update`, `projects:delete`
- `tasks:create`, `tasks:read`, `tasks:update`, `tasks:delete`
- `finance:view_revenue`, `finance:create_invoice`

---

## Authorization implementation

### Headers
Every authorized request must include the **Authorization** header:
`Authorization: Bearer <access_token>`

The server extracts `user.role`, `user.department`, and `user.permissions` from the token payload or database session to perform checks.

### API Response Codes

#### `401 Unauthorized`
- Missing or invalid JWT token.
- Token expired.

#### `403 Forbidden`
- User is authenticated but does not have the required **Role**.
- User is authenticated but does not belong to the required **Department**.
- User is authenticated but lacks the specific **Permission**.

### Example Scenarios

#### Scenario 1: Admin Access
- **User:** Admin User (`role: ADMIN`)
- **Action:** Delete a User (`DELETE /api/v1/users/123`)
- **Result:** **Allowed**. Admins have implicit permissions.

#### Scenario 2: Cross-Department Access
- **User:** Design Lead (`role: DEPARTMENT_LEAD`, `dept: DESIGN`)
- **Action:** Approve Finance Expense (`POST /api/v1/accounting/expenses/approve`)
- **Result:** **Denied (403)**. User belongs to DESIGN, but resource requires FINANCE department.

#### Scenario 3: Permission Check
- **User:** Junior Developer (`role: TEAM_MEMBER`, `dept: DEVELOPMENT`)
- **Action:** Create Project (`POST /api/v1/projects`)
- **Result:** **Denied (403)**. `TEAM_MEMBER` role does not have `projects:create` permission.
