# 💰 Invoices API

**Base URL:** `/api/v1/invoices`

| Method | Endpoint | Description | Roles |
| :--- | :--- | :--- | :--- |
| `GET` | `/` | List invoices | ADMIN, MANAGER |
| `POST` | `/` | Create an invoice | ADMIN, MANAGER |
| `GET` | `/:id` | Get invoice details | ADMIN, MANAGER |
| `PATCH` | `/:id/status` | Update invoice status | ADMIN, MANAGER |

## Usage Examples

### Create Invoice
**POST** `/api/v1/invoices`
```json
{
  "clientId": "uuid...",
  "dueDate": "2024-03-30",
  "items": [
    { "description": "Web Development", "amount": 1000, "quantity": 1 }
  ]
}
```
