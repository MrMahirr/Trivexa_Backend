# Data Protection Strategy

Trivexa is committed to protecting user data through industry-standard encryption and privacy practices.

## 1. Encryption

### 1.1 Data at Rest
- **Database**: The underlying storage (EBS Volumes / RDS) is encrypted using **AES-256**.
- **Backups**: All backups in AWS S3 are encrypted using Server-Side Encryption (SSE-S3).
- **Passwords**: Hashed using **bcrypt** (Salt rounds: 10 or 12).
- **Secrets**: API Keys and Tokens are encrypted in the database if stored, or managed via AWS Secrets Manager.

### 1.2 Data in Transit
- **TLS 1.2+**: All HTTP traffic is served over HTTPS.
- **Strict Transport Security (HSTS)**: Enabled to force browsers to use HTTPS.
- **Internal Traffic**: Communication between API and DB is encrypted via SSL/TLS.

## 2. Personally Identifiable Information (PII)

PII includes names, emails, phone numbers, and addresses.

### 2.1 Minimization
We only collect data necessary for business operations (Billing, Project Management).

### 2.2 Access
- Access to PII tables (`users`, `clients`) is restricted to authorized roles (`ADMIN`, `HR`, `PROJECT_MANAGER`).
- Developers do not have access to Production PII.

## 3. GDPR & Privacy Compliance

### 3.1 Right to be Forgotten (Deletion)
When a user requests deletion:
1.  **Soft Delete**: Mark `deleted_at` timestamp (Immediate).
2.  **Hard Delete**: A scheduled job permanently removes data after 30 days (unless required for tax/legal reasons).
3.  **Anonymization**: For reporting purposes, we may scramble names/emails instead of deleting the record.

### 3.2 Data Portability
Users can export their data (Projects, Tasks, Time Entries) via the "Export Data" feature in JSON or CSV format.
