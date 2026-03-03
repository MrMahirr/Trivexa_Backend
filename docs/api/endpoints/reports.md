# 📊 Reports API

**Base URL:** `/api/v1/reports`

| Method | Endpoint | Description | Roles |
| :--- | :--- | :--- | :--- |
| `GET` | `/financial` | Generate financial report | ADMIN, MANAGER |
| `GET` | `/projects` | Generate project analytics | ADMIN, MANAGER |

## Usage Examples

### Financial Report
**GET** `/api/v1/reports/financial?startDate=2024-01-01&endDate=2024-02-01`
