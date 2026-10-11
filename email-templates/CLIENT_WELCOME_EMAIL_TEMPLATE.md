# Client Welcome Email Template

## EmailJS Template Configuration

**Template ID:** `EMAIL_CLIENT_APPROVAL_TEMPLATE_ID`

---

## Subject Line

```
Welcome to Trivexa - Your Account is Ready!
```

---

## Email Template (HTML)

```html
<!DOCTYPE html>
<html>
<head>
  <style>
    body {
      font-family: Arial, sans-serif;
      line-height: 1.6;
      color: #333;
      max-width: 600px;
      margin: 0 auto;
      padding: 20px;
    }
    .header {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 30px;
      text-align: center;
      border-radius: 8px 8px 0 0;
    }
    .content {
      background: #f9fafb;
      padding: 30px;
      border: 1px solid #e5e7eb;
    }
    .credentials-box {
      background: white;
      border-left: 4px solid #667eea;
      padding: 20px;
      margin: 20px 0;
      border-radius: 4px;
    }
    .button {
      display: inline-block;
      background: #667eea;
      color: white;
      padding: 12px 30px;
      text-decoration: none;
      border-radius: 6px;
      margin: 20px 0;
      font-weight: bold;
    }
    .footer {
      background: #1f2937;
      color: #9ca3af;
      padding: 20px;
      text-align: center;
      font-size: 12px;
      border-radius: 0 0 8px 8px;
    }
    .warning {
      background: #fef3c7;
      border-left: 4px solid #f59e0b;
      padding: 15px;
      margin: 20px 0;
      border-radius: 4px;
    }
  </style>
</head>
<body>
  <div class="header">
    <h1>🎉 Welcome to Trivexa!</h1>
  </div>

  <div class="content">
    <p>Hi {{to_name}},</p>

    <p>Your client account has been created successfully! You can now access the Trivexa Client Portal to:</p>

    <ul>
      <li>View your projects and their progress</li>
      <li>Track time and tasks</li>
      <li>Review invoices and payments</li>
      <li>Communicate with your team</li>
    </ul>

    <div class="credentials-box">
      <h3>🔑 Your Login Credentials</h3>
      <p><strong>Email:</strong> {{email}}</p>
      <p><strong>Temporary Password:</strong> <code>{{temporary_password}}</code></p>
    </div>

    <div class="warning">
      <strong>⚠️ Important:</strong> For security reasons, you'll be required to change your password on first login.
    </div>

    <center>
      <a href="{{login_url}}" class="button">
        Login to Portal
      </a>
    </center>

    <p>If you prefer to reset your password before logging in, you can do so here:</p>
    <p><a href="{{reset_password_url}}">Reset Password</a></p>

    <hr style="margin: 30px 0; border: none; border-top: 1px solid #e5e7eb;">

    <h3>Need Help?</h3>
    <p>If you have any questions or need assistance, please don't hesitate to contact us:</p>
    <p>📧 Email: <a href="mailto:{{support_email}}">{{support_email}}</a></p>
  </div>

  <div class="footer">
    <p><strong>Trivexa</strong> - Project Management & Time Tracking</p>
    <p>© 2026 Trivexa. All rights reserved.</p>
    <p style="margin-top: 10px;">
      <a href="{{portal_url}}" style="color: #9ca3af;">Visit Portal</a> |
      <a href="mailto:{{support_email}}" style="color: #9ca3af;">Support</a>
    </p>
  </div>
</body>
</html>
```

---

## Plain Text Version

```
Welcome to Trivexa!

Hi {{to_name}},

Your client account has been created successfully!

LOGIN CREDENTIALS:
Email: {{email}}
Temporary Password: {{temporary_password}}

IMPORTANT: For security reasons, you'll be required to change your password on first login.

Login here: {{login_url}}

Or reset your password: {{reset_password_url}}

WHAT YOU CAN DO:
- View your projects and their progress
- Track time and tasks
- Review invoices and payments
- Communicate with your team

Need help? Contact us at {{support_email}}

---
Trivexa - Project Management & Time Tracking
© 2026 Trivexa. All rights reserved.
{{portal_url}}
```

---

## Template Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `{{to_email}}` | Recipient email | client@example.com |
| `{{to_name}}` | Recipient name | John |
| `{{email}}` | Login email (same as to_email) | client@example.com |
| `{{temporary_password}}` | Generated password | abc123xyz |
| `{{login_url}}` | Portal login URL | https://portal.trivexa.com/login |
| `{{reset_password_url}}` | Password reset URL | https://portal.trivexa.com/reset-password |
| `{{portal_url}}` | Portal base URL | https://portal.trivexa.com |
| `{{support_email}}` | Support contact | support@trivexa.com |

---

## Setup in EmailJS

1. Go to EmailJS Dashboard
2. Create new template
3. Template ID: Use in `EMAIL_CLIENT_APPROVAL_TEMPLATE_ID`
4. Copy HTML template above
5. Add all template variables
6. Test with sample data
7. Save and activate

---

## Testing

```bash
# Test email sending
curl -X POST http://localhost:3500/api/v1/clients/123/users \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "email": "test@example.com"
  }'

# Check logs
pm2 logs trivexa-backend | grep "Welcome email"
```

---

**Created:** 11 Ekim 2026  
**Version:** 1.0.0
