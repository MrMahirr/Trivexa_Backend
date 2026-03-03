# 💰 Payments API

**Base URL:** `/api/v1/payments`

| Method | Endpoint | Description | Roles |
| :--- | :--- | :--- | :--- |
| `POST` | `/` | Record a payment | ADMIN, MANAGER |
| `GET` | `/invoice/:invoiceId` | Get payments for an invoice | ADMIN, MANAGER |

## Usage Examples

### Record Payment
**POST** `/api/v1/payments`
```json
{
  "invoiceId": "uuid...",
  "amount": 500.00,
  "method": "BANK_TRANSFER",
  "reference": "TR1234..."
}
```
