# 💰 Expenses API

**Base URL:** `/api/v1/expenses`

| Method | Endpoint | Description | Roles |
| :--- | :--- | :--- | :--- |
| `GET` | `/` | List all expenses | ADMIN, MANAGER |
| `POST` | `/` | Create an expense request | Authenticated |
| `GET` | `/:id` | Get expense details | Authenticated |
| `PATCH` | `/:id/approve` | Approve an expense | ADMIN, MANAGER |
| `PATCH` | `/:id/reject` | Reject an expense | ADMIN, MANAGER |

## Usage Examples

### Create Expense
**POST** `/api/v1/expenses`
```json
{
  "amount": 150.00,
  "currency": "USD",
  "description": "Client lunch",
  "categoryId": "uuid..."
}
```

### Approve Expense
**PATCH** `/api/v1/expenses/:id/approve`
```json
{}
```
