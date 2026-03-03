# Pagination Standard

This document details the pagination strategy implemented across the Trivexa Backend API.
We use a **page-based** pagination system to ensure consistency and ease of use for frontend integration.

## 1. Query Parameters

Every paginated endpoint accepts the following query parameters:

| Parameter | Type | Required | Default | Description | Constraints |
|:---|:---|:---|:---|:---|:---|
| `page` | `integer` | No | `1` | The index of the page to retrieve. | Min: 1 |
| `take` | `integer` | No | `10` | The number of records per page. | Max: 100 |

### Example Request
```http
GET /api/v1/users?page=2&take=50 HTTP/1.1
Host: api.trivexa.com
Authorization: Bearer <token>
```

---

## 2. Response Structure

All paginated responses follow a strict `PageDto<T>` generic structure.

### JSON Schema
```json
{
  "data": [ ...Array of T... ],
  "meta": {
    "page": number,
    "take": number,
    "itemCount": number,
    "pageCount": number,
    "hasPreviousPage": boolean,
    "hasNextPage": boolean
  }
}
```

### Field Descriptions

- **`data`**: An array containing the requested resources for the current page.
- **`meta`**: Metadata object containing pagination details.
    - `page`: The current page number.
    - `take`: The number of items requested per page.
    - `itemCount`: The total number of items available across all pages matching the filter.
    - `pageCount`: The total number of pages based on `itemCount` and `take`.
    - `hasPreviousPage`: `true` if there is a page before the current one.
    - `hasNextPage`: `true` if there is a page after the current one.

---

## 3. Example Response

```json
{
  "data": [
    {
      "id": "123e4567-e89b-12d3-a456-426614174000",
      "name": "Project Alpha",
      "status": "IN_PROGRESS"
    },
    {
      "id": "987fcdeb-51a2-43d7-9876-543210987654",
      "name": "Project Beta",
      "status": "COMPLETED"
    }
  ],
  "meta": {
    "page": 1,
    "take": 10,
    "itemCount": 42,
    "pageCount": 5,
    "hasPreviousPage": false,
    "hasNextPage": true
  }
}
```

---

## 4. Implementation Details

### Backend DTOs
Code is structured using the following DTOs located in `src/shared/dto/`:

- **`PageOptionsDto`**: Handles parsing and validation of `page` and `take` query params.
- **`PageMetaDto`**: Service layer class that calculates metadata (`pageCount`, `hasNextPage`, etc.) based on the total count and options.
- **`PageDto<T>`**: Wrapper class that combines `data` and `meta` for the final response.

### Swagger / OpenAPI
All paginated endpoints in Swagger will explicitly show this structure under the `200 OK` response schema.
