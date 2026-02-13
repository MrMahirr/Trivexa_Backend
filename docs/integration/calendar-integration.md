# Calendar Integration Strategy

Trivexa integrates with external calendar providers (Google Calendar, Outlook) to sync meetings and tasks.

## 1. Supported Providers

- **Google Calendar**: Via Google Workspace APIs (OAuth2).
- **Outlook Calendar**: Via Microsoft Graph API (OAuth2).

## 2. Synchronization Flow

We use a **Two-Way Sync** mechanism.

### 2.1 Trivexa to External (Outbound)
When a meeting is created in Trivexa:
1.  System creates a `meeting` record in DB.
2.  Background Job (`CalendarSyncJob`) picks up the event.
3.  Job calls Provider API to create an event.
4.  External Event ID is saved back to Trivexa (`external_id`).

### 2.2 External to Trivexa (Inbound)
We use **Webhooks** (Push Notifications) to detect changes.

1.  User updates event in Google Calendar.
2.  Google sends a webhook payload to `POST /api/v1/webhooks/calendar/google`.
3.  Trivexa parses the payload and updates the local `meeting` record.

## 3. Authentication (OAuth2)

Users must authorize Trivexa to access their calendars.

- **Scopes**:
    - Google: `https://www.googleapis.com/auth/calendar.events`
    - Microsoft: `Calendars.ReadWrite`

### Token Management
- Access Tokens are short-lived (1 hour).
- Refresh Tokens are stored securely (encrypted) in the database to maintain offline access.

## 4. Conflict Resolution

If an event is modified on both sides simultaneously:
- **Rule**: The specific user action takes precedence.
- **Fallback**: "Latest Update Wins" strategy based on timestamps.
