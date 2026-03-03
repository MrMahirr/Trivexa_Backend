# Production Readiness Checklist

Before verifying the deployment of Trivexa Backend to production, ensure all items below are checked.

## 1. Security & Access

- [ ] **SSL/TLS**: HTTPS is enabled and certificates are valid (Auto-renewing via Let's Encrypt or ACM).
- [ ] **Secrets Management**: No secrets are in code. All loaded via Environment Variables or Secrets Manager.
- [ ] **Database Access**: Database is **NOT** publicly accessible. Only reachable from the App security group.
- [ ] **CORS**: `origin` is restricted to specific domains (e.g., `https://app.trivexa.com`). Wildcards removed.
- [ ] **Rate Limiting**: Enabled and tested to prevent abuse.

## 2. Infrastructure & Performance

- [ ] **Replicas**: Minimum 2 instances of the application are running for High Availability.
- [ ] **Database Resources**: Production instance size is appropriate (e.g., AWS RDS t3.medium or larger).
- [ ] **Cache**: Redis is operational and allows eviction policies if memory fills up.
- [ ] **CDN**: Check that static assets are served via CloudFront/CDN.

## 3. Monitoring & Reliability

- [ ] **Health Checks**: `/health` endpoint is returning 200 OK.
- [ ] **Logging**: Logs are shipping to a centralized system (CloudWatch, Datadog) in JSON format.
- [ ] **Alerts**:
    - [ ] CPU/Memory > 80%
    - [ ] Error Rate > 1%
    - [ ] Database Connections > 80%
- [ ] **Backups**: Automated daily backups are configured and **tested** (Test Restore performed).

## 4. Compliance & Legal

- [ ] **Terms of Service**: Links are accessible.
- [ ] **Privacy Policy**: Updated and accessible.
- [ ] **Cookie Consent**: Implemented on the frontend (if applicable).
