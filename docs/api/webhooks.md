# Webhooks Documentation

Trivexa allows you to receive real-time notifications about events happening in your account via **Webhooks**.

## 1. Webhook Mechanism

- **Delivery Method:** HTTP POST
- **Content-Type:** `application/json`
- **Timeout:** 10 seconds (Server waits for 2xx response)
- **Retries:** Exponential backoff (up to 5 attempts)

## 2. Security (HMAC Signature)

To verify that the webhook was sent by Trivexa, we include a signature in the header.

**Header:** `X-Trivexa-Signature`

### Verification Steps
1. Get your **Webhook Secret** from the Developer Settings.
2. Create a hash of the raw request body using **HMAC-SHA256** and your secret.
3. Compare the generated hash with the `X-Trivexa-Signature` header.

**Node.js Example:**
```javascript
const crypto = require('crypto');

function verifyWebhook(payload, signature, secret) {
  const hash = crypto
    .createHmac('sha256', secret)
    .update(JSON.stringify(payload))
    .digest('hex');
  
  return hash === signature;
}
```

## 3. Event Payload Structure

```json
{
  "id": "evt_123456789",
  "object": "event",
  "type": "invoice.paid",
  "created": 1678886400,
  "data": {
    "object": {
      "id": "inv_987654321",
      "amount": 5000,
      "currency": "USD",
      "status": "paid"
    }
  }
}
```

## 4. Supported Events

### Projects & Tasks
- `project.created`
- `project.status_updated`
- `task.assigned`
- `task.completed`

### Financial
- `invoice.created`
- `invoice.paid`
- `invoice.overdue`
- `payment.succeeded`
- `payment.failed`

### Client Portal
- `client.created`
- `ticket.created`
- `ticket.replied`
