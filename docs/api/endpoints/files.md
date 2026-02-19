# 📂 Files API

**Base URL:** `/api/v1/files`

| Method | Endpoint | Description | Roles |
| :--- | :--- | :--- | :--- |
| `POST` | `/upload` | Upload a file | Authenticated |
| `GET` | `/:id` | Get file metadata | Authenticated |
| `GET` | `/:id/download` | Download file stream | Authenticated |

## Usage Examples

### Upload File
**POST** `/api/v1/files/upload`
Form-Data:
- `file`: (Binary File)
- `entityType`: "project" | "task" | "user"
- `entityId`: "uuid..."
