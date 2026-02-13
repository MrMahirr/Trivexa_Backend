# Admin Manual

This guide is for System Administrators of Trivexa.

## 1. User Management

### 1.1 Inviting Users
1.  Go to **Settings > Users**.
2.  Click **"Invite User"**.
3.  Enter Email and select Role (`Manager`, `Member`).
4.  User receives an email to set their password.

### 1.2 Deactivating Users
- Go to User Profile > Click **"Deactivate"**.
- This revokes access immediately but keeps data for audits.

## 2. Roles & Permissions (RBAC)

You can configure custom roles in **Settings > Roles**.

- **Admin**: Full access.
- **Manager**: Can create Projects/Invoices.
- **Member**: Can track time and view assigned tasks.
- **Client**: Read-only access to their specific project data.

## 3. System Configuration

### 3.1 Integrations
- **Google Drive**: Connect via OAuth to sync files.
- **Slack**: Add Webhook URL for notifications.
- **Stripe**: Add Secret Key to enable payments.

### 3.2 Feature Flags
Toggle beta features in **Settings > Advanced**.

## 4. Reports

### 4.1 Financial Report
- View Monthly Recurring Revenue (MRR).
- Track outstanding invoices.

### 4.2 Performance Report
- Track team utilization (Billable vs Non-Billable hours).
