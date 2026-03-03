# Slack Integration Strategy

Trivexa uses Slack to keep the team updated on critical project events.

## 1. Features

- **Notifications**: Send alerts to specific channels (e.g., `#alerts`, `#projects`).
- **Slash Commands**: Trigger actions from Slack (e.g., `/trivexa-task`).

## 2. Incoming Webhooks (Notifications)

We use **Incoming Webhooks** to post messages.

### 2.1 Configuration
Each project or department can have a mapped Webhook URL stored in the `department_settings` or `project_settings`.

### 2.2 Triggers
- **New Project**: Notify `#general` or `#sales`.
- **Critical Bug**: Notify `#dev-team`.
- **Invoice Paid**: Notify `#finance`.

### 2.3 Message Format (Block Kit)
We use Slack **Block Kit** for rich messages.

```json
{
  "blocks": [
    {
      "type": "section",
      "text": {
        "type": "mrkdwn",
        "text": "*New Project Created: Website Redesign*"
      }
    },
    {
      "type": "section",
      "fields": [
        {
          "type": "mrkdwn",
          "text": "*Client:*\nAcme Corp"
        },
        {
          "type": "mrkdwn",
          "text": "*Budget:*\n$50,000"
        }
      ]
    }
  ]
}
```

## 3. Slash Commands (Interactive)

*Future Scope: Phase 4*

- `/trivexa-task [title]`: Create a quick task.
- `/trivexa-status [project-id]`: Get project status report.

## 4. Setup

1.  Create a Slack App at [api.slack.com](https://api.slack.com).
2.  Enable **Incoming Webhooks**.
3.  Install App to Workspace.
4.  Copy Webhook URL to Trivexa `.env` or Settings.
