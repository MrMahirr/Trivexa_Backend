# Filtering, Sorting, and Pagination

This document defines the standard query parameters used across all **List/Search** endpoints in the Trivexa API.
All list endpoints return data wrapped in a `PageDto` structure.

## 1. Pagination

We use **Page-based pagination**.

| Parameter | Type | Default | Description |
|:---|:---|:---|:---|
| `page` | `integer` | `1` | The page number to retrieve. |
| `take` | `integer` | `10` | The number of items per page. (Max: 100) |

**Example:**
`GET /api/v1/projects?page=2&take=20`

### Response Format
```json
{
  "data": [ ...items... ],
  "meta": {
    "page": 2,
    "take": 20,
    "itemCount": 20,
    "pageCount": 5,
    "hasPreviousPage": true,
    "hasNextPage": true
  }
}
```

## 2. Sorting

Sorting is handled via the `sort` query parameter.
Format: `field:direction`
- `asc`: Ascending
- `desc`: Descending

**Example:**
`GET /api/v1/invoices?sort=amount:desc`
`GET /api/v1/users?sort=createdAt:asc`

## 3. Filtering

Filters are passed as direct query parameters.
Multiple filters function as an **AND** condition.

### Exact Match
`?status=ACTIVE`
`?department=FINANCE`

### Range / Operators (where supported)
Some endpoints support advanced operators using specific syntax or separate parameters:
- **Date Range:** `startDate=2024-01-01&endDate=2024-01-31`
- **Search (Fuzzy):** `search=website` (Searches name, description, etc.)
- **Multiple Values:** `status=OPEN,IN_PROGRESS` (Comma-separated = OR)

**Example:**
`GET /api/v1/tasks?department=DESIGN&status=OPEN&assigneeId=123`

## 4. Field Implementation (Backend Guide)

When implementing a new generic list endpoint, `GenericRepository` or helper functions in `src/database/query/filters.sql.ts` should be used to parse these parameters into SQL `LIMIT`, `OFFSET`, `ORDER BY`, and `WHERE` clauses.

### SQL Generation Example
```sql
-- page=2, take=10 => OFFSET 10 LIMIT 10
-- sort=created_at:desc => ORDER BY created_at DESC
SELECT * FROM projects
WHERE status = $1
ORDER BY created_at DESC
LIMIT $2 OFFSET $3
```
